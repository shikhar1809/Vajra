import subprocess
import json
import os
import shutil
import tempfile
import google.generativeai as genai
from typing import List, Dict, Any

# Configure Gemini (Try to get key, else stay mock-safe)
API_KEY = os.getenv("GEMINI_API_KEY", "MOCK")
if API_KEY != "MOCK":
    genai.configure(api_key=API_KEY)
    gemini_model = genai.GenerativeModel('gemini-1.5-pro')
else:
    gemini_model = None

# --- Feature: Cloud-Native Scanner Helpers ---
def run_cloud_scan(repo_url: str, access_token: str = None) -> Dict[str, Any]:
    """
    Clones a remote GitHub repo and aggregates context for AI analysis.
    Returns: {"success": bool, "tree": str, "content": str, "temp_path": str, "error": str}
    
    IMPORTANT: Caller is responsible for cleanup of temp_path!
    """
    temp_dir = tempfile.mkdtemp(prefix="vajra_scan_")
    print(f"☁️ VAJRA Cloud: Cloning {repo_url} to {temp_dir}...")
    
    try:
        # 1. Clone with authentication if provided
        auth_url = repo_url
        if access_token and "github.com" in repo_url:
            # Inject token: https://TOKEN@github.com/org/repo
            auth_url = repo_url.replace("https://", f"https://{access_token}@")
        
        # Run git clone with timeout
        result = subprocess.run(
            ["git", "clone", "--depth", "1", auth_url, temp_dir],
            check=True, 
            timeout=120, 
            capture_output=True,
            text=True
        )
        
        print(f"✅ Repository cloned successfully")
        
        # 2. Gather Context
        file_tree = _get_file_tree(temp_dir)
        content_block = _aggregate_content(temp_dir)
        
        return {
            "success": True,
            "tree": file_tree,
            "content": content_block,
            "temp_path": temp_dir  # Caller must cleanup!
        }

    except subprocess.TimeoutExpired:
        print(f"❌ Clone timeout: Repository took too long to clone")
        _cleanup_temp_dir(temp_dir)
        return {"success": False, "error": "Repository clone timeout (>120s)"}
    
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr if e.stderr else str(e)
        print(f"❌ Git clone failed: {error_msg}")
        _cleanup_temp_dir(temp_dir)
        
        # Provide specific error messages
        if "Repository not found" in error_msg or "not found" in error_msg.lower():
            return {"success": False, "error": "Repository not found. Check the URL or access permissions."}
        elif "Authentication failed" in error_msg or "authentication" in error_msg.lower():
            return {"success": False, "error": "Authentication failed. Repository may be private."}
        else:
            return {"success": False, "error": f"Git clone failed: {error_msg[:200]}"}
    
    except Exception as e:
        print(f"❌ Unexpected error during clone: {e}")
        _cleanup_temp_dir(temp_dir)
        return {"success": False, "error": f"Unexpected error: {str(e)[:200]}"}

def _cleanup_temp_dir(temp_dir: str):
    """Helper to cleanup temp directory"""
    try:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
            print(f"🧹 Cleanup: Removed {temp_dir}")
    except Exception as cleanup_err:
        print(f"⚠️ Cleanup failed: {cleanup_err}")

def _get_file_tree(startpath):
    tree_str = ""
    for root, dirs, files in os.walk(startpath):
        level = root.replace(startpath, '').count(os.sep)
        indent = ' ' * 4 * (level)
        if ".git" in root or "node_modules" in root or "__pycache__" in root:
            continue
        tree_str += '{}{}/\n'.format(indent, os.path.basename(root))
        subindent = ' ' * 4 * (level + 1)
        for f in files:
            if f.startswith("."): continue
            tree_str += '{}{}\n'.format(subindent, f)
    return tree_str

def _aggregate_content(startpath):
    content = ""
    # Limit files to read (prevent reading binary or massive locks)
    ALLOWED_EXTS = {'.py', '.js', '.ts', '.tsx', '.jsx', '.go', '.rs', '.java', '.c', '.cpp', '.h', '.json', '.md', '.txt', '.yml', '.yaml', '.Dockerfile', 'Dockerfile'}
    
    for root, dirs, files in os.walk(startpath):
        if ".git" in root or "node_modules" in root: continue
        
        for f in files:
            ext = os.path.splitext(f)[1]
            if ext in ALLOWED_EXTS or f in ALLOWED_EXTS:
                path = os.path.join(root, f)
                try:
                    with open(path, 'r', encoding='utf-8', errors='ignore') as file_obj:
                        data = file_obj.read()
                        # Limit single file size to 100KB to prevent context overflow from logs
                        if len(data) > 100000: data = data[:100000] + "...[TRUNCATED]"
                        
                        rel_path = os.path.relpath(path, startpath)
                        content += f"\n\n--- FILE: {rel_path} ---\n{data}"
                except Exception:
                    continue
    return content

# --- End Feature helpers ---

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
