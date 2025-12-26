from fastapi import APIRouter, Request
from sse_starlette.sse import EventSourceResponse
import asyncio
import time
import json
from collections import defaultdict

from collections import deque

router = APIRouter()

# --- Anomaly Detector ---
class AnomalyDetector:
    def __init__(self, window_seconds: float = 1.0, threshold_count: int = 10):
        self.window_seconds = window_seconds
        self.threshold_count = threshold_count
        # IP -> deque of timestamps
        self.history = defaultdict(lambda: deque())

    def track_request(self, ip: str) -> float:
        """
        Record a request and return the current threat score (0.0 to 100.0+).
        """
        now = time.time()
        timestamps = self.history[ip]
        
        # Add new request
        timestamps.append(now)
        
        # Remove old requests based on sliding window
        while timestamps and timestamps[0] < now - self.window_seconds:
            timestamps.popleft()
            
        count = len(timestamps)
        
        # Calculate Threat Score
        # Score = (Current Count / Threshold) * 50
        # If count == threshold, score is 50. If double threshold, score is 100.
        score = (count / self.threshold_count) * 50.0
        return score

# Initialize Detector with 1 second window and 20 request threshold (20 req/sec)
detector = AnomalyDetector(window_seconds=1.0, threshold_count=20)

# --- SSE Queue ---
# A simple list of queues to broadcast messages to connected clients
clients = []

async def broadcast_event(event_type: str, data: dict):
    disconnected_clients = []
    for queue in clients:
        try:
            # Ensure proper JSON serialization
            payload = json.dumps(data) if isinstance(data, dict) else data
            await queue.put({"event": event_type, "data": payload})
        except Exception:
            disconnected_clients.append(queue)
    
    for c in disconnected_clients:
        if c in clients:
            clients.remove(c)

@router.post("/api/v1/threats/simulate")
async def simulate_threat_event():
    """
    Manually triggers a simulated DDoS threat event for demo purposes.
    """
    threat_data = {
        "source_ip": "192.168.1.66 (SIMULATED)",
        "timestamp": time.time(),
        "type": "DoS_ATTACK",
        "threat_score": 99.9,
        "severity": "CRITICAL",
        "message": "CRITICAL: IP 192.168.1.66 exceeded 500 req/sec. Blocking."
    }
    await broadcast_event("threat", threat_data)
    return {"status": "Simulated", "data": threat_data}

@router.get("/api/v1/threats/stream")
async def stream_threats(request: Request):
    """
    SSE Endpoint for real-time threat streaming.
    """
    queue = asyncio.Queue()
    clients.append(queue)
    
    async def event_generator():
        try:
            while True:
                # Wait for new event
                message = await queue.get()
                yield message
                # Check if client disconnected
                if await request.is_disconnected():
                    break
        except asyncio.CancelledError:
            pass
        finally:
            if queue in clients:
                clients.remove(queue)

    return EventSourceResponse(event_generator())

# --- Middleware Helper to be called from main.py ---
async def check_ddos(request: Request) -> bool:
    """
    Checks if request limit exceeded. Returns True if request should be blocked.
    """
    ip = request.client.host
    
    # Track request via Anomaly Detector
    threat_score = detector.track_request(ip)
    
    # Threshold is 20 requests in 1 second (Score 50.0)
    # If limit exceeded (count > 20), score will be > 50.0
    if threat_score > 50.0:
        # Detected!
        threat_data = {
            "source_ip": ip,
            "timestamp": time.time(),
            "type": "DoS_ATTACK",
            "threat_score": round(threat_score, 2),
            "severity": "CRITICAL",
            "message": f"CRITICAL: IP {ip} exceeded 20 req/sec limit. Blocking."
        }
        await broadcast_event("threat", threat_data)
        return True # Block Request
        
    return False # Allow Request
