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

@router.post("/api/v1/employees/{employee_id}/assign-training")
def assign_remedial_training(employee_id: str):
    """
    Action: Assign remedial training to a user.
    """
    con = get_db_con()
    if not con:
        return {"error": "Database error"}
    
    # Update status
    con.execute("UPDATE employees SET training_status = 'Remedial-Required' WHERE id = ?", [employee_id])
    
    return {"status": "success", "message": f"Remedial training assigned to employee {employee_id}"}
