import subprocess
import json
import os
import tempfile
from typing import Dict, Any

class Scanner:
    def __init__(self):
        self.semgrep_tool = "semgrep"
        self.trivy_tool = "trivy"
    
    def run_semgrep(self, target_path: str) -> Dict[str, Any]:
        """
        Execute Semgrep scan and return JSON results.
        Uses p/default community ruleset for comprehensive scanning.
        """
        if not os.path.exists(target_path):
            return {"error": "Target path does not exist", "results": []}
        
        try:
            command = [
                self.semgrep_tool,
                "scan",
                "--json",
                "--config", "p/default",  # Community ruleset
                target_path
            ]
            
            print(f"🔍 Running Semgrep: {' '.join(command)}")
            
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                check=False  # Semgrep returns non-zero if findings exist
            )
            
            # Parse the JSON output from the binary
            if result.stdout:
                scan_data = json.loads(result.stdout)
                print(f"✅ Semgrep scan complete: {len(scan_data.get('results', []))} findings")
                return {
                    "status": "success",
                    "engine": "Semgrep",
                    "results": scan_data.get("results", []),
                    "stats": scan_data.get("paths", {})
                }
            else:
                return {
                    "error": "Semgrep scan failed",
                    "stderr": result.stderr,
                    "results": []
                }
        except Exception as e:
            print(f"❌ Semgrep error: {str(e)}")
            return {"error": str(e), "results": []}

    
    def scan_code_snippet(self, code: str, filename: str = "snippet.py") -> Dict[str, Any]:
        """Scan a code snippet by saving it temporarily"""
        with tempfile.TemporaryDirectory() as tmpdir:
            file_path = os.path.join(tmpdir, filename)
            
            with open(file_path, "w") as f:
                f.write(code)
            
            return self.run_semgrep(tmpdir)
    
    def run_trivy(self, target_path: str) -> Dict[str, Any]:
        """Execute Trivy scan for container vulnerabilities"""
        try:
            command = [
                self.trivy_tool,
                "fs",
                "--format", "json",
                target_path
            ]
            
            print(f"Running Trivy: {' '.join(command)}")
            
            result = subprocess.run(
                command,
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0 and not result.stdout:
                return {
                    "error": "Trivy scan failed",
                    "stderr": result.stderr,
                    "results": []
                }
            
            scan_data = json.loads(result.stdout)
            return {
                "status": "success",
                "engine": "Trivy",
                "results": scan_data.get("Results", [])
            }
        except Exception as e:
            return {"error": str(e), "results": []}
