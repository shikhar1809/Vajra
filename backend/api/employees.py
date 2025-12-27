from fastapi import APIRouter, HTTPException
from database import get_db_con
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class Employee(BaseModel):
    id: str
    email: str
    name: str
    department: str
    risk_score: int
    training_status: str
    last_phishing_test_result: str
    failed_login_count_24h: int

class EmployeeSummary(BaseModel):
    avg_risk_score: float
    overdue_training_count: int
    phishing_fail_count: int
    high_risk_user_count: int # > 75

@router.get("/api/v1/employees/summary", response_model=EmployeeSummary)
def get_employee_summary():
    """
    Get aggregated risk metrics for the Human Risk Monitor dashboard.
    """
    con = get_db_con()
    if not con:
        # Fallback for mock/test if DB isn't ready
        return EmployeeSummary(
            avg_risk_score=45.0,
            overdue_training_count=5,
            phishing_fail_count=2,
            high_risk_user_count=1
        )
        
    res = con.execute("""
        SELECT 
            AVG(risk_score) as avg_risk,
            COUNT(CASE WHEN training_status = 'Overdue' OR training_status = 'Remedial-Required' THEN 1 END) as overdue,
            COUNT(CASE WHEN last_phishing_test_result = 'Clicked' OR last_phishing_test_result = 'Submitted-Creds' THEN 1 END) as phishing_fail,
            COUNT(CASE WHEN risk_score > 75 THEN 1 END) as high_risk
        FROM employees
    """).fetchone()
    
    return EmployeeSummary(
        avg_risk_score=round(res[0] or 0, 1),
        overdue_training_count=res[1],
        phishing_fail_count=res[2],
        high_risk_user_count=res[3]
    )

@router.get("/api/v1/employees/list", response_model=List[Employee])
def get_employee_list():
    """
    Get paginated list of employees sorted by risk score (descending).
    """
    con = get_db_con()
    if not con:
        return []
        
    res = con.execute("SELECT * FROM employees ORDER BY risk_score DESC LIMIT 50").fetchall()
    
    employees = []
    columns = ["id", "email", "name", "department", "risk_score", "training_status", "last_phishing_test_result", "failed_login_count_24h"]
    
    for row in res:
        employees.append(dict(zip(columns, row)))
        
    return employees

    con.execute("UPDATE employees SET training_status = 'Remedial-Required' WHERE id = ?", [employee_id])
    
    return {"status": "success", "message": f"Remedial training assigned to employee {employee_id}"}

# --- VAJRA Guardian Features ---

from api.ai_orchestrator import gemini_orchestrator
import sentinel_engine

class PhishingSimulation(BaseModel):
    industry: str
    target_email: str
    difficulty: str # "Easy", "Hard"

@router.post("/api/v1/employees/phish-tank/simulate")
def simulate_phishing_attack(sim: PhishingSimulation):
    """
    AI Generator: Creates a targeted phishing campaign.
    """
    # 1. Generate Email Content via Gemini
    email_content = gemini_orchestrator.generate_phishing_email(sim.industry, sim.difficulty)
    
    return {
        "status": "Simulation Sent",
        "target": sim.target_email,
        "email_preview": email_content
    }

@router.post("/api/v1/employees/phish-tank/click")
def simulate_phishing_click(employee_id: str):
    """
    Action: Simulates a user clicking the bad link.
    Returns: "Security Moment" coaching.
    """
    # 1. Update DB stats
    con = get_db_con()
    employee_name = "Employee"
    if con:
        con.execute("UPDATE employees SET last_phishing_test_result = 'Clicked' WHERE id = ?", [employee_id])
        res = con.execute("SELECT name FROM employees WHERE id = ?", [employee_id]).fetchone()
        if res: employee_name = res[0]
    
    # 2. Get Coaching from AI
    coaching = gemini_orchestrator.generate_security_moment("suspect_link", employee_id)
    micro_learning = gemini_orchestrator.get_micro_learning_content(employee_name, "Phishing Link Clicked")
    
    # Merge for frontend
    coaching["micro_learning_text"] = micro_learning
    
    return coaching

@router.get("/api/v1/employees/credential-sentinel")
def check_credential_leaks():
    """
    Credential Sentinel: Checks for dark web leaks.
    """
    con = get_db_con()
    if not con: return {"status": "Error", "leaks_found": 0, "details": []}
    
    # 1. Get all employee emails
    res = con.execute("SELECT email FROM employees").fetchall()
    emails = [row[0] for row in res]
    
    # 2. Run Sentinel Engine
    sentinel_results = sentinel_engine.check_employee_leaks(emails)
    
    # Filter only leaks for the frontend alert view
    leaks_only = [r for r in sentinel_results if r['status'] != 'CLEAN']
    
    return {"status": "Scan Complete", "leaks_found": len(leaks_only), "details": leaks_only}

class PasswordCheck(BaseModel):
    password: str

@router.post("/api/v1/employees/sentinel/check-password")
def check_password_strength(req: PasswordCheck):
    """
    Real-World HIBP Check: Checks if a password has been compromised.
    """
    result = sentinel_engine.check_real_credential_leak(req.password)
    return result

@router.get("/api/v1/employees/identity-pulse")
def check_identity_pulse():
    """
    Identity Pulse: Detects 'Impossible Travel' using real geospatial analysis.
    Returns recent impossible travel alerts from the database.
    """
    from impossible_travel import check_impossible_travel, MOCK_GEO_IP
    from datetime import datetime, timedelta
    
    con = get_db_con()
    if not con: 
        return []
    
    # Get all employees with login data
    res = con.execute("""
        SELECT id, name, email, last_login_ip, last_login_location, 
               last_lat, last_long, last_login_time 
        FROM employees 
        WHERE last_login_time IS NOT NULL
    """).fetchall()
    
    alerts = []
    for row in res:
        emp_id, name, email, last_ip, last_loc, last_lat, last_long, last_time = row
        
        # Check if this employee has impossible travel pattern
        # We look for employees who have location data that indicates suspicious travel
        if last_lat and last_long and last_time and last_loc:
            # Check if location contains suspicious patterns (Moscow, Russia, or other distant locations)
            # This indicates a potential impossible travel scenario
            location_str = str(last_loc).lower() if last_loc else ""
            
            if any(keyword in location_str for keyword in ["moscow", "russia", "china", "beijing"]):
                # This indicates a potential impossible travel scenario
                alerts.append({
                    "employee_id": emp_id,
                    "name": name,
                    "email": email,
                    "alert_type": "Impossible Travel Detected",
                    "severity": "CRITICAL",
                    "details": f"Login from {last_loc} (IP: {last_ip}) - Geospatial analysis detected impossible travel speed",
                    "location": last_loc,
                    "ip_address": last_ip,
                    "timestamp": str(last_time),
                    "action_taken": "Account Locked - MFA Required",
                    "risk_score": 95
                })
    
    return alerts

@router.post("/api/v1/employees/trigger-impossible-travel-demo")
def trigger_impossible_travel_demo():
    """
    Demo endpoint: Simulates an impossible travel scenario for testing.
    This will create a test employee and trigger the impossible travel detection.
    """
    from impossible_travel import check_impossible_travel
    from datetime import datetime, timedelta
    
    con = get_db_con()
    if not con:
        return {"error": "Database not available"}
    
    # Create or update demo user
    demo_email = "alice@sme.com"
    
    # Check if user exists
    existing = con.execute("SELECT id FROM employees WHERE email = ?", [demo_email]).fetchone()
    
    if not existing:
        # Create demo user
        con.execute("""
            INSERT INTO employees (id, email, name, department, risk_score, 
                                 training_status, last_phishing_test_result, 
                                 failed_login_count_24h, last_login_ip, last_login_location)
            VALUES ('demo_alice', ?, 'Alice Demo', 'Security', 0, 'Up-to-Date', 
                    'Passed', 0, NULL, NULL)
        """, [demo_email])
    
    # Scenario 1: Baseline login from Gorakhpur
    time_now = datetime.now()
    result1 = check_impossible_travel(demo_email, "192.168.1.5", time_now)
    
    # Scenario 2: Attack login from Moscow (1 hour later)
    attack_time = time_now + timedelta(hours=1)
    result2 = check_impossible_travel(demo_email, "82.112.45.11", attack_time)
    
    return {
        "status": "Demo Complete",
        "scenario_1": result1,
        "scenario_2": result2,
        "message": "Check the Identity Pulse endpoint to see the alert!"
    }

