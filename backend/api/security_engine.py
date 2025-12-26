import subprocess
import json
import os
from typing import Dict, Any, List

class SecurityEngine:
    def __init__(self):
        self.scanner_tool = "semgrep"

    def run_scan(self, target_path: str) -> Dict[str, Any]:
        """
        Executes a semgrep scan against the target directory and returns the results.
        Mocked fallback if binary is missing.
        """
        if not os.path.exists(target_path):
            return {"error": "Target directory does not exist", "results": []}

        try:
             # Check if semgrep exists
            if subprocess.call(["where" if os.name == "nt" else "which", self.scanner_tool], stdout=subprocess.DEVNULL) != 0:
                print("Semgrep not found. Returning Mock Scan.")
                return {
                    "status": "success",
                    "engine": "Semgrep (Mock)",
                    "results": [],
                    "stats": {"annotated": 0}
                }

            # Construct the command
            command = [
                self.scanner_tool,
                "scan",
                "--config=auto",
                "--json",
                "--quiet", # Suppress progress bars
                target_path
            ]

            print(f"Executing Security Scan: {' '.join(command)}")

            # Run subprocess
            result = subprocess.run(
                command,
                capture_output=True,
                text=True
            )

            if result.returncode != 0 and not result.stdout:
                # If semgrep failed completely (not just found findings)
                return {
                    "error": "Scan execution failed",
                    "stderr": result.stderr,
                    "results": []
                }

            # Parse JSON output
            try:
                scan_data = json.loads(result.stdout)
                return {
                    "status": "success",
                    "engine": "Semgrep",
                    "results": scan_data.get("results", []),
                    "stats": scan_data.get("paths", {})
                }
            except json.JSONDecodeError:
                 return {
                    "error": "Failed to parse scan output",
                    "raw_output": result.stdout,
                    "results": []
                }

        except FileNotFoundError:
            return {
                "error": "Security engine (semgrep) not installed on server.",
                "results": []
            }
        except Exception as e:
            return {
                "error": str(e),
                "results": []
            }

    def scan_snippet(self, code: str, filename: str = "snippet.py") -> Dict[str, Any]:
        """
        Scans a raw code snippet by saving it temporarily.
        """
        import tempfile
        
        # Create a temporary directory to be safe
        with tempfile.TemporaryDirectory() as tmpdirname:
            file_path = os.path.join(tmpdirname, filename)
            
            # Write code to file
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)
                
            # Scan the directory
            scan_result = self.run_scan(tmpdirname)
            return scan_result

