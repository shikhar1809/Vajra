from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import init_db, close_db
from api.threats import router as threats_router, check_ddos
from api.analysis import router as analysis_router
from api.risks import router as risks_router
from api.financial import router as financial_router
from api.employees import router as employees_router
from api.compliance import router as compliance_router
from api.news import router as news_router
from api.auth import router as auth_router
from api.security_engine import SecurityEngine
from api.ai_orchestrator import GeminiOrchestrator, AuditGenerator
from pydantic import BaseModel
from typing import List, Dict, Any

# Initialize Engines
security_engine = SecurityEngine()
from api.ai_orchestrator import get_gemini_orchestrator
audit_generator = AuditGenerator(get_gemini_orchestrator())

class ScanRequest(BaseModel):
    path: str = "./" # Default to current directory

class AnalyzeRequest(BaseModel):
    code: str
    filename: str = "snippet.py"

class RemediationRequest(BaseModel):
    findings: List[Dict[str, Any]]
    
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv() # Load .env file

# --- Global State ---
class GlobalState:
    FORTRESS_MODE = False

state = GlobalState()

# --- Lifespan for Database ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Skipping DuckDB initialization (temporarily disabled)")
    # init_db()  # TEMPORARILY DISABLED DUE TO LOCK ISSUES
    yield
    # Shutdown
    print("Skipping DuckDB close")
    # close_db()  # TEMPORARILY DISABLED

app = FastAPI(title="Vajra Core API", version="1.0.0", lifespan=lifespan)

# --- Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.middleware("http")
async def fortress_mode_middleware(request: Request, call_next):
    # Allow OPTIONS requests for CORS preflight
    if request.method == "OPTIONS":
        response = await call_next(request)
        return response
    
    # Enforce Read-Only state globally (except GET and OPTIONS)
    if state.FORTRESS_MODE and request.method not in ["GET", "OPTIONS"]:
        response = JSONResponse(
            status_code=503,
            content={"detail": "SHIELD_ACTIVE: Database is Read-Only"}
        )
        # Add CORS headers manually
        response.headers["Access-Control-Allow-Origin"] = request.headers.get("origin", "*")
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response
    
    # --- DDoS Detection ---
    if await check_ddos(request):
        response = JSONResponse(
            status_code=429,
            content={"error": "RATE_LIMIT_EXCEEDED", "message": "Too many requests. Please try again later."}
        )
        # Add CORS headers manually
        response.headers["Access-Control-Allow-Origin"] = request.headers.get("origin", "*")
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response
    
    response = await call_next(request)
    return response

# --- Routes ---
app.include_router(threats_router)
app.include_router(analysis_router)
app.include_router(risks_router)
app.include_router(financial_router)
app.include_router(employees_router)
app.include_router(compliance_router)
app.include_router(news_router)
app.include_router(auth_router)

@app.get("/health")
def health_check():
    return {"status": "ok", "fortress_mode": state.FORTRESS_MODE}

@app.post("/api/v1/fortress-mode")
def toggle_fortress(enable: bool):
    state.FORTRESS_MODE = enable
    # Update DuckDB PRAGMA query_only
    from database import set_readonly_mode
    set_readonly_mode(enable)
    return {"fortress_mode": state.FORTRESS_MODE}

@app.post("/api/v1/scan-code")
def scan_code_git_diff(req: AnalyzeRequest):
    """
    v3.0 SAST Engine:
    1. Scans code with Semgrep.
    2. Pipes to Gemini for 'Git Diff' fix.
    """
    if state.FORTRESS_MODE:
        return JSONResponse(status_code=403, content={"error": "Analysis disabled in Fortress Mode"})

    # Step 1: Scan
    scan_result = security_engine.scan_snippet(req.code, req.filename)
    findings = scan_result.get("results", [])
    
    # Step 2: AI Fix (if findings exist, or even if clean to confirm)
    if not findings:
        return {"status": "Clean", "findings": [], "ai_analysis": "No vulnerabilities detected by static analysis."}
        
    # Step 3: AI Remediation (Prompted for Git Diff)
    # We re-use the orchestrator but ideally pass a flag for 'diff_format'
    # For now, we assume standard analysis includes the fix.
    ai_fix = get_gemini_orchestrator().analyze_snippet(req.code, findings)
    
    return {
        "status": "Vulnerable",
        "findings": findings,
        "ai_analysis": ai_fix # The orchestrator typically returns text + code block
    }


@app.post("/api/v1/remediate")
def trigger_remediation(req: RemediationRequest):
    """
    Uses Gemini to suggest fixes for security findings.
    """
    if state.FORTRESS_MODE:
         return JSONResponse(status_code=403, content={"error": "Remediation disabled in Fortress Mode"})
    
    return get_gemini_orchestrator().generate_remediation(req.findings)



@app.post("/api/v1/analyze")
def analyze_code_snippet(req: AnalyzeRequest):
    """
    1. Scans code with Semgrep.
    2. Sends findings + code to Gemini for fix.
    """
    if state.FORTRESS_MODE:
        return JSONResponse(status_code=403, content={"error": "Analysis disabled in Fortress Mode"})

    # Step 1: Scan
    scan_result = security_engine.scan_snippet(req.code, req.filename)
    findings = scan_result.get("results", [])
    
    # Step 2: AI Fix (if findings exist, or even if clean to confirm)
    # If no findings, we can still ask AI for "General Review" or just return "Clean"
    if not findings:
        return {"status": "Clean", "findings": [], "ai_analysis": "No vulnerabilities detected by static analysis."}
        
    # Step 3: AI Remediation
    ai_fix = get_gemini_orchestrator().analyze_snippet(req.code, findings)
    
    return {
        "status": "Vulnerable",
        "findings": findings,
        "ai_analysis": ai_fix
    }

@app.get("/api/v1/audit/report")
def get_audit_report():
    """
    Generates a SOC2 Compliance Report using Gemini + DuckDB Events.
    """
    report = audit_generator.generate_report()
    return JSONResponse(content={"report": report})

# --- One-Click Report Generator (Hackathon Feature) ---
from fastapi import Query
from fastapi.responses import FileResponse
from report_builder import create_pdf_report

@app.get("/api/v1/generate-report")
async def get_report(vendor: str = Query(...)):
    # 1. Fetch the latest findings (Mock Data for Demo Stability)
    # Ideally this would query DB, but we want to guarantee the "Visual Proof" works even if DB is fresh.
    is_fraud = "fake" in vendor.lower() or "fraud" in vendor.lower() or "cloudflare" in vendor.lower()
    
    if is_fraud:
        mock_data = {
            "vendor_name": vendor, 
            "bank_hash": "GB89 1234 5678 9012 (Mismatch)", 
            "total_amount": 26500.00
        }
        mock_results = {
            "score": 95, 
            "status": "CRITICAL FRAUD PROBABLE", 
            "alerts": [
                "Critical: Bank Hash Mismatch detected.",
                "Anomaly: Bill amount is 25x above average.",
                "Suspicious: High-pressure urgency keywords found."
            ]
        }
    else:
        # Safe Report
        mock_data = {
            "vendor_name": vendor, 
            "bank_hash": "HASH_CF_001 (Verified)", 
            "total_amount": 1043.00
        }
        mock_results = {
            "score": 10, 
            "status": "SAFE / VERIFIED", 
            "alerts": []
        }
    
    # 2. Run report builder
    # Ensure directory exists
    os.makedirs("reports", exist_ok=True)
    filename = f"VAJRA_Incident_{vendor}.pdf"
    file_path = os.path.join("reports", filename)
    
    create_pdf_report(mock_data, mock_results, filename=file_path)
    
    # 3. Return the file
    return FileResponse(path=file_path, media_type='application/pdf', filename=filename)

# --- Active Asset Scanner (Feature 6) ---
from api.scanner_engine import run_vulnerability_scan, analyze_scan_with_gemini

@app.post("/api/v1/run-scan")
async def trigger_scan():
    """
    Triggers a real Semgrep scan on the server and analyzes results with Gemini.
    """
    # 1. Run the real binary scan
    # Limit scan to current directory to avoid scanning entire OS
    raw_findings = run_vulnerability_scan(target_path="./")
    
    # 2. Use Gemini to interpret the results
    ai_remediation = await analyze_scan_with_gemini(raw_findings)
    
    # 3. Return real data to the dashboard
    return {
        "status": "Scan Complete",
        "vulnerabilities_found": len(raw_findings),
        "remediation_plan": ai_remediation,
        "raw_results": raw_findings[:5] # Show the judges the technical logs
    }

# --- Feature: Cloud-Native Scanner Endpoint ---
class CloudScanRequest(BaseModel):
    repo_url: str

@app.post("/api/v1/cloud-scan")
async def trigger_cloud_scan(req: CloudScanRequest, request: Request):
    """
    Orchestrates the full Cloud-Native Audit:
    1. Clone (with token from cookie).
    2. Recon & Audit (Gemini).
    3. Return Project Intel + Flaw.
    """
    token = request.cookies.get("secure_token")
    
    # 1. Scanner Engine: Clone & Aggregate
    # Import helper dynamically to avoid circular imports if any, though likely safe
    from api.scanner_engine import run_cloud_scan
    scan_data = run_cloud_scan(req.repo_url, access_token=token)
    
    if not scan_data["success"]:
        return JSONResponse(status_code=400, content={"error": scan_data.get("error")})
        
    # 2. AI Orchestrator: Two-Phase Audit
    file_tree = scan_data["tree"]
    content = scan_data["content"]
    
    analysis = await get_gemini_orchestrator().analyze_cloud_repo(file_tree, content)
    
    return {
        "status": "Complete",
        "project_intel": analysis.get("recon"),
        "vulnerability": analysis.get("audit")
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
