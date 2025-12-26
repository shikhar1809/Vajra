import os
import json
import google.generativeai as genai
from database import get_db_con

class AIOrchestrator:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-pro')
            print("✅ Gemini 1.5 Pro initialized")
        else:
            self.model = None
            print("⚠️  GEMINI_API_KEY not found. AI features disabled.")
    
    async def generate_code_fix_async(self, code: str, findings: list) -> dict:
        """
        Pipes Semgrep findings to Gemini 1.5 Pro to generate a 'fix diff'.
        Uses async for better performance.
        """
        if not self.model:
            return {"error": "AI Engine unavailable"}
        
        if not findings:
            return {
                "vulnerability": "None",
                "severity": "Info",
                "explanation": "No vulnerabilities found. Code is clean.",
                "diff": ""
            }
        
        # Condensed prompt to stay within token limits while getting actionable fixes
        prompt = f"""
You are a VAJRA Security Analyst. Triage these Semgrep findings:
{json.dumps(findings[:5], indent=2)} 

1. Identify the most critical vulnerability.
2. Provide a 'Secure Code Snippet' to fix it.
3. Explain why the fix works in 2 sentences.

OUTPUT FORMAT (JSON):
{{
    "vulnerability": "Brief vulnerability name",
    "severity": "High/Medium/Low",
    "explanation": "Why this is dangerous and how the fix works",
    "diff": "--- original\\n+++ fixed\\n@@ -1,3 +1,3 @@\\n-vulnerable_line\\n+fixed_line"
}}

Return ONLY valid JSON, no markdown.
        """
        
        try:
            response = await self.model.generate_content_async(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            return {"error": f"AI Error: {str(e)}"}
    
    def generate_code_fix(self, code: str, findings: list) -> dict:
        """Synchronous wrapper for generate_code_fix_async"""
        import asyncio
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        return loop.run_until_complete(self.generate_code_fix_async(code, findings))

    
    def generate_soc2_report(self) -> str:
        """Generate SOC2 compliance report from events table"""
        if not self.model:
            return "# Error: AI Engine unavailable"
        
        con = get_db_con()
        events = con.execute("""
            SELECT timestamp, event_type, source, severity, details 
            FROM events 
            WHERE timestamp > now() - INTERVAL 24 HOUR
            ORDER BY timestamp DESC
        """).fetchall()
        
        events_text = "\n".join([
            f"- {e[0]}: {e[1]} ({e[3]}) - {e[4]}"
            for e in events
        ])
        
        prompt = f"""
        You are a formal Security Auditor preparing a SOC2 compliance report.
        
        TASK: Analyze the following security events from the last 24 hours and create a professional SOC2 compliance report in Markdown format.
        
        EVENTS:
        {events_text}
        
        REPORT STRUCTURE:
        # SOC2 Compliance Report
        ## Executive Summary
        ## Security Events Analysis
        ## Risk Assessment
        ## Recommendations
        ## Compliance Status
        
        Use professional language. Be concise but thorough.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"# Error generating report\n\n{str(e)}"
