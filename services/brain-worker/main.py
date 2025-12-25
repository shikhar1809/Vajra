from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import ssl
import socket
import dns.resolver
import requests
from strsimpy.levenshtein import Levenshtein
import re
import subprocess
import shutil
import tempfile
import os
import uuid
import json

app = FastAPI(title="Vajra Brain Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

levenshtein = Levenshtein()

# --- Data Models ---
class SentryRequest(BaseModel):
    url: str                # users input: e.g. "g0ogle.com"
    target: str = "google.com" # legitimate domain to compare against

class ScoutRequest(BaseModel):
    domain: str             # e.g. "vendor-example.com"

# --- CORE LOGIC: Sentry (Phishing) ---
@app.post("/sentry/scan")
def scan_phishing(req: SentryRequest):
    """
    Check if 'url' is a typosquatting attempt of 'target'.
    """
    # 1. Basic cleaning
    suspect = req.url.lower().replace("https://", "").replace("http://", "").split("/")[0]
    target = req.target.lower().replace("https://", "").replace("http://", "").split("/")[0]

    # 2. Levenshtein Distance
    # distance 1 or 2 means very close but different -> High Risk
    dist = levenshtein.distance(suspect, target)
    
    risk_level = "Low"
    alert_type = "None"
    
    if suspect == target:
        return {"status": "Safe", "message": "Domain matches target exactly."}
        
    if 0 < dist <= 2:
        risk_level = "Critical"
        alert_type = "Typosquatting Detected"
    elif 2 < dist <= 4:
        risk_level = "Medium"
        alert_type = "Potential Impersonation"

    return {
        "suspect_domain": suspect,
        "target_domain": target,
        "distance": dist,
        "risk": risk_level,
        "type": alert_type
    }

# --- CORE LOGIC: Scout (Vendor Risk) ---
@app.post("/scout/assess")
def assess_vendor(req: ScoutRequest):
    """
    Calculate a risk score (0-100) based on SPF, SSL, and Headers.
    Start at 100, deduct points for failures.
    """
    domain = req.domain.replace("https://", "").replace("http://", "").split("/")[0]
    score = 100
    report = []

    # 1. DNS SPF Check
    try:
        answers = dns.resolver.resolve(domain, 'TXT')
        spf_found = False
        for rdata in answers:
            if "v=spf1" in rdata.to_text():
                spf_found = True
                break
        if not spf_found:
            score -= 10
            report.append("Missing SPF Record (-10)")
        else:
            report.append("SPF Record Found (OK)")
    except Exception:
        score -= 10
        report.append("DNS/SPF Lookup Failed (-10)")

    # 2. SSL/TLS Check
    # We connect to port 443 and check protocol version
    try:
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=3) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                version = ssock.version() # e.g. TLSv1.2, TLSv1.3
                if version in ["TLSv1", "TLSv1.1"]:
                    score -= 20
                    report.append(f"Obsolete SSL Version: {version} (-20)")
                else:
                    report.append(f"SSL Version {version} (OK)")
    except Exception as e:
        # If we can't connect via SSL, that's bad for a modern site
        score -= 20
        report.append(f"SSL Connection Failed: {str(e)} (-20)")

    # 3. Security Headers (X-Frame-Options)
    try:
        # Try to hit the site
        resp = requests.get(f"https://{domain}", timeout=3)
        headers = resp.headers
        if 'X-Frame-Options' not in headers and 'Content-Security-Policy' not in headers:
             score -= 5
             report.append("Missing Anti-Clickjacking Headers (-5)")
        else:
             report.append("Security Headers Present (OK)")
    except Exception:
        # Can't reach http endpoint
        report.append("HTTP Endpoint Unreachable (Skipped Header Check)")

    return {
        "domain": domain,
        "score": max(0, score),
        "details": report
    }

# --- CORE LOGIC: Aegis (Code & Secret Scanning) ---
@app.post("/aegis/scan")
async def scan_code(file: UploadFile = File(...)):
    """
    Receives a zip file, runs Semgrep and TruffleHog, and returns a consolidated JSON report.
    """
    scan_id = str(uuid.uuid4())
    tmp_dir = tempfile.gettempdir()
    scan_path = os.path.join(tmp_dir, scan_id)
    
    os.makedirs(scan_path, exist_ok=True)
    
    # 1. Save and Unzip
    zip_path = os.path.join(scan_path, file.filename)
    with open(zip_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        shutil.unpack_archive(zip_path, scan_path)
    except:
        shutil.rmtree(scan_path)
        raise HTTPException(status_code=400, detail="Invalid zip file")

    results = {
        "scan_id": scan_id,
        "vulnerabilities": [],
        "secrets": []
    }

    # 2. Run Semgrep (SAST)
    # Using 'p/security-audit' config which is a good general purpose security set
    try:
        semgrep_cmd = [
            "semgrep", "scan",
            "--config=p/security-audit",
            "--json",
            scan_path
        ]
        # Allow stderr to be captured to avoid cluttering logs, but check return code/output
        proc = subprocess.run(semgrep_cmd, capture_output=True, text=True)
        if proc.returncode == 0 or proc.returncode == 1: # 0=no issues, 1=issues found (usually)
            semgrep_data = json.loads(proc.stdout)
            # Normalize Semgrep output
            for res in semgrep_data.get("results", []):
                results["vulnerabilities"].append({
                    "tool": "Semgrep",
                    "path": res.get("path", "").replace(scan_path, ""),
                    "line": res.get("start", {}).get("line"),
                    "severity": res.get("extra", {}).get("severity"),
                    "message": res.get("extra", {}).get("message")
                })
    except Exception as e:
        results["errors"] = [f"Semgrep failed: {str(e)}"]

    # 3. Run TruffleHog (Secrets)
    try:
        # trufflehog filesystem <path> --json
        trufflehog_cmd = [
            "trufflehog", "filesystem",
            scan_path,
            "--json"
        ]
        proc = subprocess.run(trufflehog_cmd, capture_output=True, text=True)
        # TruffleHog outputs line-delimited JSON for each finding
        if proc.stdout:
            for line in proc.stdout.splitlines():
                if line.strip():
                    try:
                        secret = json.loads(line)
                        results["secrets"].append({
                            "tool": "TruffleHog",
                            "path": secret.get("SourceMetadata", {}).get("Data", {}).get("Filesystem", {}).get("file", "").replace(scan_path, ""),
                            "detector": secret.get("DetectorName"),
                            "raw_secret": secret.get("Raw", "")[:5] + "***" # Redact for safety
                        })
                    except:
                        pass
    except Exception as e:
         if "errors" not in results: results["errors"] = []
         results["errors"].append(f"TruffleHog failed: {str(e)}")

    # 4. Cleanup
    shutil.rmtree(scan_path)
    
    return results

@app.get("/")
def read_root():
    return {"status": "online", "engine": "Brain (Python)", "features": ["Sentry", "Scout", "Aegis"]}

@app.get("/health")
def health_check():
    return {"status": "ok"}

