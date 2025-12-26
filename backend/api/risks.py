from fastapi import APIRouter
from database import get_db_con

router = APIRouter()

@router.get("/api/v1/risks/scores")
def get_risk_scores():
    """
    Fetch Vendor Risk Scores from DuckDB View.
    """
    con = get_db_con()
    if not con:
        return {"error": "Database not initialized"}
    
    # Query the view
    result = con.execute("SELECT * FROM vendor_risk_scores").fetchall()
    
    # Format response
    vendors = []
    columns = ["vendor_id", "vendor_name", "category", "data_access_level", "cve_count", "risk_score"]
    
    for row in result:
        vendors.append(dict(zip(columns, row)))
        
    return {"vendors": vendors}

@router.get("/api/v1/vendors")
def get_vendors():
    """
    Fetch all vendors from DuckDB.
    """
    con = get_db_con()
    if not con:
        return {"error": "Database not initialized"}
    
    # Query vendor_risks table
    result = con.execute("SELECT * FROM vendor_risks").fetchall()
    
    # Format response
    vendors = []
    columns = ["vendor_id", "vendor_name", "category", "data_access_level", "cve_count", "last_audit_date"]
    
    for row in result:
        vendor_dict = dict(zip(columns, row))
        # Convert date to string for JSON serialization
        if vendor_dict.get("last_audit_date"):
            vendor_dict["last_audit_date"] = str(vendor_dict["last_audit_date"])
        vendors.append(vendor_dict)
        
    return {"vendors": vendors}

@router.post("/api/v1/vendors/{vendor_id}/breach")
def simulate_breach(vendor_id: str):
    """
    Simulate a vendor breach:
    1. Sets Risk Score to 100.
    2. Logs a critical event.
    """
    con = get_db_con()
    if not con:
        return {"error": "Database not initialized"}
        
    # Update Vendor Risk
    con.execute("UPDATE vendors SET risk_score = 100, criticality = 'CRITICAL' WHERE id = ?", [vendor_id])
    
    # Log Event
    con.execute("""
        INSERT INTO events VALUES
        (nextval('seq_events_id'), now(), 'VENDOR_BREACH_CONFIRMED', 'ThreatIntel_Feed', 'CRITICAL', ?)
    """, [f"Vendor {vendor_id} access data compromised. Immediate containment required."])
    
    return {"status": "breached", "vendor_id": vendor_id, "risk_score": 100}
