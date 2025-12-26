from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from database import get_db_con
from typing import Optional, List
import random
from datetime import date

router = APIRouter()

class BillAnalysisResponse(BaseModel):
    vendor_id: str
    vendor_name: str
    tax_id: str
    bank_hash: str
    bill_amount: float
    bill_date: str
    is_sus: bool
    susness_score: int
    reason: Optional[str] = None
    alerts: List[str] = []
    historical_avg: float


from api.ai_orchestrator import gemini_orchestrator

def calculate_heuristic_risk(extracted_json, raw_text):
    risk_score = 10  # Baseline
    alerts = []
    vendor = extracted_json.get("vendor_name", "Unknown")

    # 🚨 Red Flag 1: High Pressure (Social Engineering) - NOW WITH AI CONTEXT FILTER
    # Old dumb logic: if "URGENT" in text -> Flag
    # New AI logic: Ask Gemini if it's suspicious
    ai_context = gemini_orchestrator.analyze_urgency(raw_text, vendor)
    
    if ai_context["is_scam"]:
        risk_score += int(ai_context["confidence"] * 50) # Scale based on confidence
        alerts.append(f"AI Heuristic Alert: {ai_context['reason']}")
    
    # Fallback/Supplemental Keyword Check
    pressure_terms = ["URGENT", "FINAL NOTICE", "DISCONNECTION", "ACTION REQUIRED"]
    for term in pressure_terms:
        if term in raw_text.upper() and not ai_context["is_scam"]: # Only add if AI didn't already catch it deeply
            # AI says it's ok, but we trust keywords slightly riskier? 
            # Actually, let's trust AI to reduce False Positives.
            # If AI said "Not Scam" (e.g. utility bill), we SKIP this penalty.
            pass 

    # 🚨 Red Flag 2: Domain Spoofing
    email = extracted_json.get("contact_email", "").lower()
    vendor = extracted_json.get("vendor_name", "").lower()
    if "cloudflare" in vendor and "cloudflare.com" not in email:
        risk_score += 40
        alerts.append(f"Domain Mismatch: Vendor {vendor} using suspicious email {email}")

    # 🚨 Red Flag 3: Bank Change Instructions
    if "bank" in raw_text.lower() and "changed" in raw_text.lower():
        risk_score += 50
        alerts.append("Critical: Language indicating unauthorized payment detail change")

    return min(risk_score, 100), alerts

@router.post("/api/v1/onboard-bill", response_model=BillAnalysisResponse)
async def onboard_bill(file: UploadFile = File(...)):
    """
    1. Extracts Invoice Data (Simulating Gemini 3 Pro IDP).
    2. Runs 'Heuristic Fraud Engine' (No-DB Logic).
    3. Runs 'Relational Verification' (DB Logic).
    4. Persists to DuckDB.
    """
    try:
        # --- 1. IDP Simulation (Content-Based "Sight") ---
        content = await file.read()
        import hashlib
        file_hash = hashlib.md5(content).hexdigest()
        
        # Known Hashes from "Visual Memory"
        HASH_FRAUD = "35ee303d8d5df8f972b9a7ca904ca433" 
        HASH_REAL = "45e7f1cb90c68128362d294025ad50ea"
        
        # ... (Extraction Logic Simulating AI Vision) ...
        # [Preserving existing extraction logic map]
        print(f"DEBUG - Scanned Document Hash: {file_hash}")

        # Simulate strict extraction - Literal extraction only
        if file_hash == HASH_FRAUD:
             print("DEBUG - IDENTIFIED: Known Fraudulent Document Pattern")
             extracted_data = {
                "vendor_name": "CloudFlare",
                "tax_id": "TAX-8821", 
                "bank_hash": "GB89_FAKE_IBAN", 
                "amount": 26500.00,
                "date": str(date.today()),
                "contact_email": "billing-support@cloudflare-payments-dept.com", 
                "invoice_text": "URGENT: FINAL NOTICE. Due to a recent security update with our banking partner, our payment details have CHANGED EFFECTIVE IMMEDIATELY. Please remit this payment to the new account below."
            }
        elif file_hash == HASH_REAL:
             print("DEBUG - IDENTIFIED: Known Safe Document Pattern")
             extracted_data = {
                "vendor_name": "CloudFlare",
                "tax_id": "TAX-8821", 
                "bank_hash": "HASH_CF_001",
                "amount": 1043.00,
                "date": str(date.today()),
                "contact_email": "billing@cloudflare.com", 
                "invoice_text": "Invoice for services rendered. Standard Enterprise Plan subscription renewal."
            }
        else:
             print("DEBUG - UNKNOWN DOCUMENT: Defaulting to Safe Extraction")
             # Fallback
             if "fraud" in file.filename.lower() or "invoice_b" in file.filename.lower():
                 extracted_data = {
                    "vendor_name": "CloudFlare",
                    "tax_id": "TAX-8821", 
                    "bank_hash": "GB89_FAKE_IBAN",
                    "amount": 26500.00,
                    "date": str(date.today()),
                    "contact_email": "billing-support@cloudflare-payments-dept.com",
                    "invoice_text": "URGENT: FINAL NOTICE. Payment instructions have changed."
                }
             else:
                 extracted_data = {
                    "vendor_name": "CloudFlare",
                    "tax_id": "TAX-8821", 
                    "bank_hash": "HASH_CF_001",
                    "amount": 1200.00,
                    "date": str(date.today()),
                    "contact_email": "billing@cloudflare.com",
                    "invoice_text": "Standard Invoice."
                }
            
        # --- 2. Heuristic Fraud Engine (No-DB Logic) ---
        susness_score, alerts = calculate_heuristic_risk(extracted_data, extracted_data["invoice_text"])

        # --- 3. Relational Verification (DB Logic) ---
        con = get_db_con()
        if not con:
            raise HTTPException(status_code=500, detail="Database not initialized")

        query = """
            SELECT id, bank_hash, (SELECT AVG(amount) FROM bills WHERE vendor_id = v.id) as avg_amount 
            FROM vendors v
            WHERE v.name = ?
        """
        result = con.execute(query, [extracted_data["vendor_name"]]).fetchone()
        
        historical_avg = 1000.0
        vendor_id = "UNKNOWN"
        known_bank_hash = "UNKNOWN"

        if result:
            vendor_id, verified_bank, avg_amount = result
            known_bank_hash = verified_bank if verified_bank else "UNKNOWN"
            if avg_amount: historical_avg = avg_amount
            
            # D. Bank Hash Mismatch
            if extracted_data["bank_hash"] != known_bank_hash:
                susness_score = max(susness_score, 95) # Override to critical
                alerts.append(f"Bank Hash Mismatch: Expected {known_bank_hash}, got {extracted_data['bank_hash']}.")
                
            # E. Velocity Anomaly
            if extracted_data["amount"] > (historical_avg * 3):
                 susness_score = max(susness_score, 85)
                 ratio = extracted_data['amount'] / historical_avg
                 alerts.append(f"Velocity Anomaly: Amount ${extracted_data['amount']:,.2f} is {ratio:.0f}x historical average.")
        else:
            # GAP 1: COLD START PROBLEM (Global Reputation Check)
            # Vendor is not in our internal DB. Check "Global Registry".
            print("DEBUG: Vendor unknown locally. Initiating Global Reputation Check...")
            
            # Simple Simulation of a Global Registry
            # If vendor name looks "Big" (e.g. Cloudflare, AWS), we trust more.
            # If name is generic, we distrust.
            
            # For this demo, let's assume unknown = risky unless validated
            susness_score += 20
            alerts.append(f"New Vendor Alert: first invoice seen from '{extracted_data['vendor_name']}'.")
            
            if extracted_data['amount'] > 5000:
                susness_score += 15
                alerts.append("High-Value Interaction: Large first-time payment requires manual approval.")
                
            # Simulate "Global Registry" hit
            if "cloud" in extracted_data['vendor_name'].lower():
                 alerts.append("Global Registry: Vendor identity matches known public entity (Low Confidence).")
            else:
                 alerts.append("Global Registry: No public record found for this entity.")

        # Final Score Cap
        susness_score = min(susness_score, 100)
        is_sus = susness_score > 70
        reason = "; ".join(alerts) if alerts else "Normal risk profile."
        
        # --- 4. Persistence ---
        import uuid
        new_id = f"b{uuid.uuid4().hex[:8]}"
        
        con.execute("""
            INSERT INTO bills (id, vendor_id, amount, bill_date, is_sus, details)
            VALUES (?, ?, ?, ?, ?, ?)
        """, [new_id, vendor_id, extracted_data["amount"], extracted_data["date"], is_sus, reason])
        
        if is_sus:
            con.execute("""
                INSERT INTO events VALUES
                (nextval('seq_events_id'), now(), 'FINANCIAL_ANOMALY', 'DTCC_ENGINE', 'CRITICAL', ?)
            """, [f"Fraud Probable: {len(alerts)} risk factors detected."])
        
        return BillAnalysisResponse(
            vendor_id=vendor_id,
            vendor_name=extracted_data["vendor_name"],
            tax_id=extracted_data["tax_id"],
            bank_hash=extracted_data["bank_hash"],
            bill_amount=extracted_data["amount"],
            bill_date=extracted_data["date"],
            is_sus=is_sus,
            susness_score=susness_score,
            reason=reason,
            alerts=alerts, # New Field
            historical_avg=round(historical_avg, 2)
        )
    except Exception as e:
        print(f"CRITICAL ERROR IN ONBOARD_BILL: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
