import duckdb
import asyncio

# Connect to DB in Read-Only mode to avoid locks with running backend
db = duckdb.connect('vajra_prod.db', read_only=True)

async def analyze_bill(extracted_json: dict):
    print(f"🔎 Analyzing Bill for: {extracted_json.get('vendor_name')}")
    print(f"💰 Amount: ${extracted_json.get('total_amount')}")
    print(f"🏦 Presented Bank Hash: {extracted_json.get('bank_details')}")
    
    vendor_name = extracted_json.get("vendor_name")
    new_bank_details = extracted_json.get("bank_details") 
    current_bill_amount = extracted_json.get("total_amount")

    # Adapted Query for actual Schema (bank_hash column)
    # Using LEFT JOIN or just relying on Vendors table mostly, but logic requested JOIN.
    # We will use the logic provided but adapted column names.
    query = f"""
        SELECT bank_hash, (SELECT AVG(amount) FROM bills WHERE vendor_id = v.id) as avg_amount 
        FROM vendors v
        WHERE v.name = '{vendor_name}'
    """
    
    # Note: Original query joined bills directly implies if no bills, row might drop or avg is null.
    # This subquery approach is safer if no bills exist yet.
    
    try:
        result = db.execute(query).fetchone()
    except Exception as e:
        print(f"Database Error: {e}")
        return

    # Initial safety state
    risk_score = 10
    alerts = []
    status = "SAFE"

    if result:
        verified_bank, avg_historic_amount = result
        # Handle case where no previous bills exist (None)
        avg_historic_amount = avg_historic_amount if avg_historic_amount else 1000.0 
        
        print(f"✅ Ground Truth: Bank={verified_bank}, AvgAmount=${avg_historic_amount}")

        # 🚨 CHECK 1: Identity Integrity (Bank Account Mismatch)
        # Fraud Detection Logic: If the account on the bill != our verified record
        if new_bank_details != verified_bank:
            risk_score += 60
            alerts.append("CRITICAL: UNKNOWN PAYMENT DETAILS DETECTED")
            status = "HIGH RISK"

        # 🚨 CHECK 2: Velocity Anomaly (The 3x Rule)
        # Fraud Detection Logic: If amount is significantly higher than average
        if current_bill_amount > (avg_historic_amount * 3):
            risk_score += 25
            alerts.append("ANOMALY: BILL AMOUNT EXCEEDS HISTORICAL AVERAGE")
            status = "SUSPICIOUS"
            
        if risk_score > 60:
             status = "CRITICAL FRAUD"
    else:
        # Case for a brand new vendor with no history
        risk_score = 40
        alerts.append("NEW VENDOR: INITIAL VERIFICATION REQUIRED")
        status = "NEEDS REVIEW"

    # Final Risk Normalization
    risk_score = min(risk_score, 100)

    return {
        "status": status,
        "risk_score": risk_score,
        "alerts": alerts,
        "extracted_data": extracted_json
    }

# Mock Payload simulating a Fraud Attack
fraud_payload = {
    "vendor_name": "CloudFlare",
    "bank_details": "HASH_EVIL_HACKER_123", # Mismatch!
    "total_amount": 50000.00 # High Value!
}

# Run it
result = asyncio.run(analyze_bill(fraud_payload))
print("\n📋 ANALYSIS RESULT:")
print(result)
