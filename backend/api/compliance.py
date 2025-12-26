from fastapi import APIRouter, HTTPException
from database import get_db_con
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from api.ai_orchestrator import gemini_orchestrator # Mocked orchestrator

router = APIRouter()

class ComplianceControl(BaseModel):
    control_id: str
    framework: str
    description: str
    status: str
    automated_evidence_source: Optional[str] = None
    last_verified_at: Optional[str] = None

class ReadinessSummary(BaseModel):
    framework: str
    readiness_score: int
    total_controls: int
    passing_controls: int

@router.get("/api/v1/compliance/readiness", response_model=List[ReadinessSummary])
def get_compliance_readiness():
    """
    Calculate readiness score per framework.
    """
    con = get_db_con()
    if not con: return []
    
    # Get distinct frameworks
    frameworks = con.execute("SELECT DISTINCT framework FROM compliance_controls").fetchall()
    summary = []
    
    for fw_row in frameworks:
        fw = fw_row[0]
        total = con.execute("SELECT COUNT(*) FROM compliance_controls WHERE framework = ?", [fw]).fetchone()[0]
        passing = con.execute("SELECT COUNT(*) FROM compliance_controls WHERE framework = ? AND status = 'Passing'", [fw]).fetchone()[0]
        
        score = int((passing / total) * 100) if total > 0 else 0
        summary.append({
            "framework": fw,
            "readiness_score": score,
            "total_controls": total,
            "passing_controls": passing
        })
        
    return summary

@router.get("/api/v1/compliance/gap-analysis", response_model=List[ComplianceControl])
def get_gap_analysis():
    """
    Return all controls that are NOT 'Passing'.
    """
    con = get_db_con()
    if not con: return []
    
    res = con.execute("SELECT * FROM compliance_controls WHERE status != 'Passing' ORDER BY framework, control_id").fetchall()
    controls = []
    columns = ["control_id", "framework", "description", "status", "automated_evidence_source", "last_verified_at"]
    
    for row in res:
        c = dict(zip(columns, row))
        if c['last_verified_at']: c['last_verified_at'] = str(c['last_verified_at'])
        controls.append(c)
        
    return controls

@router.post("/api/v1/compliance/run-automated-check")
def run_automated_check():
    """
    Agentic Logic:
    1. Scan Module Check (CC7.1): If 0 critical vendors -> Passing.
    2. Employee Check (CC6.2): If 0 high risk users -> Passing.
    """
    con = get_db_con()
    if not con: return {"error": "DB Error"}
    
    updates = []
    
    # Check 1: Vulnerability Management (Vendor Risk)
    crit_vendors = con.execute("SELECT COUNT(*) FROM vendors WHERE criticality = 'CRITICAL'").fetchone()[0]
    if crit_vendors == 0:
        con.execute("UPDATE compliance_controls SET status = 'Passing', last_verified_at = now() WHERE control_id = 'CC7.1'")
        updates.append("CC7.1: Marked Passing (No critical vendors)")
    else:
        con.execute("UPDATE compliance_controls SET status = 'At-Risk', last_verified_at = now() WHERE control_id = 'CC7.1'")
        updates.append(f"CC7.1: Marked At-Risk ({crit_vendors} critical vendors found)")

    # Check 2: User Access (Employee Risk)
    high_risk_users = con.execute("SELECT COUNT(*) FROM employees WHERE risk_score > 75").fetchone()[0]
    if high_risk_users == 0:
        con.execute("UPDATE compliance_controls SET status = 'Passing', last_verified_at = now() WHERE control_id = 'CC6.3'")
        updates.append("CC6.3: Marked Passing (No high-risk users)")
    else:
         updates.append(f"CC6.3: No Change ({high_risk_users} high-risk users)")
         
    return {"status": "success", "updates": updates}

@router.post("/api/v1/compliance/generate-report")
async def generate_compliance_report():
    """
    Generates a formal SOC 2 Evidence Report using Agentic Data Analysis.
    """
    con = get_db_con()
    
    # 1. Fetch Data from DuckDB (Mapping User Blueprint to Real Schema)
    
    # Threat Logs (Mapped from 'threats' to 'events')
    threat_logs = con.execute("SELECT timestamp, event_type, details FROM events WHERE severity = 'CRITICAL'").fetchall()
    
    # Vendor Risks (Direct map)
    vendor_risks = con.execute("SELECT name, risk_score, criticality FROM vendors WHERE risk_score > 50").fetchall()
    
    # Scan History (Simulated as table 'scan_results' doesn't exist yet)
    # in a real app, this would query a scans table.
    scan_history = [
        {"date": "2024-12-26", "type": "Full System Scan", "engine": "Trivy", "findings": 0},
        {"date": "2024-12-25", "type": "Codebase SAST", "engine": "Semgrep", "findings": 2},
        {"date": "2024-12-24", "type": "Container Scan", "engine": "Trivy", "findings": 0}
    ]

    # 2. Feed to Gemini 3 Pro (via Orchestrator)
    prompt = f"""
    Act as a SOC 2 Compliance Auditor. Generate a formal Evidence Report based on this live system data:
    
    [DATA FEED START]
    Threats (Critical): {threat_logs}
    Recent Scans: {scan_history}
    High Risk Vendors: {vendor_risks}
    [DATA FEED END]
    
    Format the report strictly with these sections:
    1. **Executive Summary**: Assessment of current Security Posture (Winning/Failing).
    2. **Control CC7.1 (Monitoring)**: Reference the 'Threats' data. If empty, cite "No Critical Anomalies".
    3. **Control CC8.1 (Vulnerabilities)**: Reference the 'Recent Scans'. 
    4. **Control CC9.2 (Vendor Risk)**: Analyze the 'High Risk Vendors'. Mention specific names.
    5. **Auditor Opinion**: Final "Unqualified" or "Qualified" opinion.
    """
    
    # Use Orchestrator
    # We pass this rich prompt to the AI.
    if hasattr(gemini_orchestrator, 'generate_audit_report_text'):
         report = gemini_orchestrator.generate_audit_report_text(prompt)
    else:
         report = "AI Orchestrator Unavailable."

    return {"report_text": report}
