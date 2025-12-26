from fastapi import FastAPI, Request, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import List, Dict, Any
import asyncio
import time
from collections import defaultdict, deque

from database import init_db, close_db, get_db_con, set_readonly_mode
from scanner import Scanner
from ai_orchestrator import AIOrchestrator

# Initialize engines
scanner = Scanner()
ai_orchestrator = AIOrchestrator()

# Global state
class GlobalState:
    FORTRESS_MODE = False

state = GlobalState()

# SSE clients
sse_clients = []

# Rate limiting
class RateLimiter:
    def __init__(self, window_seconds: float = 1.0, threshold: int = 20):
        self.window_seconds = window_seconds
        self.threshold = threshold
        self.history = defaultdict(lambda: deque())
    
    def check_request(self, ip: str) -> tuple[bool, float]:
        """Returns (should_block, threat_score)"""
        now = time.time()
        timestamps = self.history[ip]
        
        timestamps.append(now)
        
        while timestamps and timestamps[0] < now - self.window_seconds:
            timestamps.popleft()
        
        count = len(timestamps)
        threat_score = (count / self.threshold) * 50.0
        
        return count > self.threshold, threat_score

rate_limiter = RateLimiter()

# Lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Initializing VAJRA Security Platform...")
    init_db()
    yield
    print("🔒 Shutting down...")
    close_db()

app = FastAPI(title="VAJRA Security Platform", version="1.0.0", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Middleware
@app.middleware("http")
async def fortress_and_rate_limit_middleware(request: Request, call_next):
    # Allow OPTIONS for CORS
    if request.method == "OPTIONS":
        return await call_next(request)
    
    # Fortress Mode check
    if state.FORTRESS_MODE and request.method not in ["GET", "OPTIONS"]:
        response = JSONResponse(
            status_code=503,
            content={"detail": "FORTRESS MODE ACTIVE: System is Read-Only"}
        )
        response.headers["Access-Control-Allow-Origin"] = request.headers.get("origin", "*")
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response
    
    # Rate limiting
    ip = request.client.host
    should_block, threat_score = rate_limiter.check_request(ip)
    
    if should_block:
        # Broadcast threat via SSE
        await broadcast_sse({
            "event": "threat",
            "data": {
                "source_ip": ip,
                "timestamp": time.time(),
                "type": "DoS_ATTACK",
                "threat_score": round(threat_score, 2),
                "severity": "CRITICAL",
                "message": f"IP {ip} exceeded 20 req/sec limit"
            }
        })
        
        response = JSONResponse(
            status_code=429,
            content={"error": "RATE_LIMIT_EXCEEDED", "message": "Too many requests"}
        )
        response.headers["Access-Control-Allow-Origin"] = request.headers.get("origin", "*")
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response
    
    return await call_next(request)

# SSE broadcast helper
async def broadcast_sse(message: dict):
    print(f"🔴 Broadcasting SSE message to {len(sse_clients)} clients: {message}")
    disconnected = []
    for queue in sse_clients:
        try:
            await queue.put(message)
            print(f"  ✅ Sent to client queue")
        except Exception as e:
            print(f"  ❌ Failed to send: {e}")
            disconnected.append(queue)
    
    for q in disconnected:
        if q in sse_clients:
            sse_clients.remove(q)
    
    print(f"📊 Active SSE clients: {len(sse_clients)}")

# Routes
@app.get("/health")
def health_check():
    return {"status": "healthy", "fortress_mode": state.FORTRESS_MODE}

@app.get("/api/v1/threats/stream")
async def stream_threats(request: Request):
    """SSE endpoint for real-time threat streaming"""
    queue = asyncio.Queue()
    sse_clients.append(queue)
    
    async def event_generator():
        try:
            while True:
                message = await queue.get()
                # Convert data to valid JSON string
                import json
                yield {
                    "event": message.get("event", "message"),
                    "data": json.dumps(message.get("data", {}))  # Use json.dumps for valid JSON
                }
                
                if await request.is_disconnected():
                    break
        except asyncio.CancelledError:
            pass
        finally:
            if queue in sse_clients:
                sse_clients.remove(queue)
    
    return EventSourceResponse(event_generator())

# Vendor endpoints
@app.get("/api/v1/vendors")
def get_vendors():
    con = get_db_con()
    vendors = con.execute("SELECT * FROM vendors ORDER BY risk_score DESC").fetchall()
    return {
        "vendors": [
            {
                "id": v[0],
                "name": v[1],
                "category": v[2],
                "risk_score": v[3],
                "last_audit": str(v[4]),
                "data_access_level": v[5]
            }
            for v in vendors
        ]
    }

class VendorCreate(BaseModel):
    id: str
    name: str
    category: str
    risk_score: int
    data_access_level: str

@app.post("/api/v1/vendors")
def create_vendor(vendor: VendorCreate):
    con = get_db_con()
    con.execute("""
        INSERT INTO vendors VALUES (?, ?, ?, ?, CURRENT_DATE, ?)
    """, [vendor.id, vendor.name, vendor.category, vendor.risk_score, vendor.data_access_level])
    return {"status": "created", "vendor": vendor.dict()}

@app.post("/api/v1/vendors/{vendor_id}/breach")
async def simulate_breach(vendor_id: str):
    """Simulate a vendor breach - updates risk score and broadcasts event"""
    con = get_db_con()
    
    # Increase risk score
    con.execute("""
        UPDATE vendors 
        SET risk_score = LEAST(risk_score + 30, 100)
        WHERE id = ?
    """, [vendor_id])
    
    # Log event
    con.execute("""
        INSERT INTO events VALUES
        (nextval('seq_events_id'), now(), 'VENDOR_BREACH', ?, 'CRITICAL', ?)
    """, [vendor_id, f"Simulated breach for vendor {vendor_id}"])
    
    # Broadcast via SSE
    await broadcast_sse({
        "event": "breach",
        "data": {
            "vendor_id": vendor_id,
            "timestamp": time.time(),
            "severity": "CRITICAL",
            "message": f"Vendor {vendor_id} breach simulated"
        }
    })
    
    return {"status": "breach_simulated", "vendor_id": vendor_id}

# Code analysis endpoints
class CodeAnalysisRequest(BaseModel):
    code: str
    filename: str = "snippet.py"

@app.post("/api/v1/scan/upload")
async def upload_and_scan(file: UploadFile = File(...)):
    """Upload file and run Semgrep scan"""
    import tempfile
    import os
    
    with tempfile.TemporaryDirectory() as tmpdir:
        file_path = os.path.join(tmpdir, file.filename)
        
        with open(file_path, "wb") as f:
            f.write(await file.read())
        
        scan_result = scanner.run_semgrep(tmpdir)
        
        if scan_result.get("results"):
            # Get AI fix
            code_content = open(file_path, "r").read()
            ai_fix = ai_orchestrator.generate_code_fix(code_content, scan_result["results"])
            return {
                "status": "vulnerable",
                "scan_results": scan_result,
                "ai_fix": ai_fix
            }
        
        return {"status": "clean", "scan_results": scan_result}

@app.post("/api/v1/analyze")
def analyze_code(req: CodeAnalysisRequest):
    """Analyze code snippet with Semgrep + Gemini"""
    scan_result = scanner.scan_code_snippet(req.code, req.filename)
    
    if not scan_result.get("results"):
        return {"status": "clean", "findings": []}
    
    ai_fix = ai_orchestrator.generate_code_fix(req.code, scan_result["results"])
    
    return {
        "status": "vulnerable",
        "findings": scan_result["results"],
        "ai_fix": ai_fix
    }

# Fortress Mode
@app.post("/api/v1/fortress/toggle")
def toggle_fortress(enable: bool):
    state.FORTRESS_MODE = enable
    set_readonly_mode(enable)
    return {"fortress_mode": state.FORTRESS_MODE}

# Compliance
@app.get("/api/v1/compliance/report")
def generate_compliance_report():
    """Generate SOC2 compliance report using Gemini"""
    report = ai_orchestrator.generate_soc2_report()
    return {"report": report, "format": "markdown"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
