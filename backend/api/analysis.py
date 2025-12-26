from fastapi import APIRouter, UploadFile, File, HTTPException
# import google.generativeai as genai (Mocked)
import subprocess
import os
import tempfile
import json

router = APIRouter()

# Initialize Gemini (Mocked)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or "MOCK_KEY"

async def scan_with_semgrep(file_path: str) -> dict:
    """
    Run Semgrep on the file and return JSON output.
    """
    try:
        # Check if semgrep is installed, else return mock
        if subprocess.call(["where" if os.name == "nt" else "which", "semgrep"], stdout=subprocess.DEVNULL) != 0:
             return {"results": [], "mock": "Semgrep not installed locally"}

        # Run semgrep with a generic security config
        result = subprocess.run(
            ["semgrep", "--config=p/security-audit", "--json", file_path],
            capture_output=True,
            text=True
        )
        if result.returncode != 0 and not result.stdout:
            print(f"Semgrep Error: {result.stderr}")
            return {"parsed_results": [], "raw": result.stderr}
            
        return json.loads(result.stdout)
    except Exception as e:
        # print(f"Semgrep Logic Error: {e}")
        return {"parsed_results": [], "error": str(e)}

async def analyze_with_gemini(semgrep_results: dict, code_content: str) -> str:
    """
    Mock: Pipe Semgrep results to Gemini for code-fix suggestions.
    """
    return "Simulated AI Analysis: No critical vulnerabilities found. (Mocked for Stability)"

@router.post("/api/v1/analysis/scan")
async def scan_code(file: UploadFile = File(...)):
    """
    Upload a file -> Run Semgrep -> Pipe to Gemini -> Return Fix.
    """
    content = await file.read()
    code_text = content.decode("utf-8")
    
    # Save to temp file for Semgrep
    with tempfile.NamedTemporaryFile(delete=False, suffix=".py", mode="w", encoding="utf-8") as tmp:
        tmp.write(code_text)
        tmp_path = tmp.name
    
    try:
        # 1. Run Semgrep
        semgrep_data = await scan_with_semgrep(tmp_path)
        
        # 2. AI Analysis
        ai_fix = await analyze_with_gemini(semgrep_data, code_text)
        
        return {
            "findings": semgrep_data.get("results", []),
            "ai_analysis": ai_fix
        }
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
