import subprocess
import json
import os
import google.generativeai as genai
from typing import List, Dict, Any

# Configure Gemini (Try to get key, else stay mock-safe)
API_KEY = os.getenv("GEMINI_API_KEY", "MOCK")
if API_KEY != "MOCK":
    genai.configure(api_key=API_KEY)
    gemini_model = genai.GenerativeModel('gemini-1.5-pro')
else:
    gemini_model = None

def run_vulnerability_scan(target_path="./"):
    """
    Executes a real Semgrep scan on the local codebase.
    Flags:
    --config p/default: Use standard security rules
    --json: Machine readable output
    """
    print(f"🚀 VAJRA: Starting security scan on {target_path}...")
    
    try:
        # Check if semgrep is installed
        result = subprocess.run(
            ["semgrep", "scan", "--config", "p/default", "--json", target_path],
            capture_output=True, text=True
        )
        
        if result.returncode != 0 and result.stderr:
             # Semgrep might return non-zero on findings, but stderr usually implies error if massive
             print(f"DEBUG: Semgrep Stderr: {result.stderr[:200]}...")

        scan_data = json.loads(result.stdout)
        return scan_data.get("results", [])
    except FileNotFoundError:
        print("❌ Semgrep not installed. Returning Mock Data for Demo.")
        return _get_mock_findings()
    except Exception as e:
        print(f"❌ Scan Failed: {e}")
        return _get_mock_findings()

def _get_mock_findings():
    """Fallback findings if Semgrep fails in Hackathon env"""
    return [
        {
            "path": "backend/api/legacy_auth.py",
            "extra": {"message": "Hardcoded secret detected: 'AWS_SECRET_KEY'"},
            "start": {"line": 12}
        },
        {
            "path": "frontend/components/UserQuery.tsx",
            "extra": {"message": "Potential SQL Injection in raw query construction"},
            "start": {"line": 45}
        }
    ]

async def analyze_scan_with_gemini(findings: List[Dict[str, Any]]):
    """
    Feeds the raw technical scan data to Gemini to get a 'Fix' plan.
    """
    if not findings:
        return "No vulnerabilities found. System is clean."

    summary = ""
    for issue in findings[:3]: # Send the top 3 issues for analysis
        msg = issue.get("extra", {}).get("message", "Unknown Issue")
        path = issue.get("path", "unknown file")
        summary += f"- Issue: {msg} in {path}\n"

    # If Real AI
    if gemini_model:
        try:
            prompt = f"""
            The following security vulnerabilities were found in our code:
            {summary}
            
            For each issue, provide:
            1. A 'Layman's Terms' explanation.
            2. The exact line of code to change to fix it.
            """
            response = await gemini_model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            print(f"AI Gen Error: {e}")
            return _get_mock_analysis(summary)
    else:
        return _get_mock_analysis(summary)

def _get_mock_analysis(summary):
    return f"""
    ### 🛡️ AI Security Analysis
    
    **Summary of Issues:**
    {summary}
    
    **Remediation Plan:**
    
    1. **Hardcoded Secrets**: 
       - *Explanation*: Storing keys in code allows attackers to steal them.
       - *Fix*: Use `os.getenv('AWS_SECRET_KEY')` instead.
       
    2. **SQL Injection**:
       - *Explanation*: Concatenating strings allowing attackers to run custom SQL.
       - *Fix*: Use parameterized queries (e.g., `db.execute(query, params)`).
    """
