from fpdf import FPDF
from datetime import datetime

class VajraReport(FPDF):
    def header(self):
        # Header with branding
        self.set_font('Arial', 'B', 15)
        self.set_text_color(255, 0, 0) # VAJRA RED
        self.cell(0, 10, 'VAJRA: CYBER INSURANCE & INCIDENT READINESS REPORT', 0, 1, 'C')
        self.set_font('Arial', '', 10)
        self.set_text_color(0, 0, 0)
        self.cell(0, 10, f'Report Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}', 0, 1, 'R')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def create_pdf_report(vendor_data, heuristic_results, filename="VAJRA_Incident_Report.pdf"):
    pdf = VajraReport()
    pdf.add_page()

    # Section 1: Executive Summary
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, '1. EXECUTIVE SUMMARY', 0, 1, 'L')
    pdf.set_font('Arial', '', 11)
    summary_text = (
        f"VAJRA's Real-Time Anomaly Engine detected a high-risk transaction involving "
        f"{vendor_data['vendor_name']}. The transaction has been automatically flagged "
        f"for immediate review due to a risk score of {heuristic_results['score']}/100."
    )
    pdf.multi_cell(0, 10, summary_text)
    pdf.ln(5)

    # Section 2: Actuarial Risk Reduction (NEW)
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, '2. ACTUARIAL RISK REDUCTION SUMMARY', 0, 1, 'L')
    pdf.set_font('Arial', '', 11)
    actuarial_text = (
        "This report demonstrates proactive risk controls active in this organization, including "
        "Multi-Factor Vendor Verification, Real-time Anomaly Detection, and Automated Vulnerability Patching. "
        "Presenting this evidence to cyber insurance underwriters may qualify this organization "
        "for reduced premiums and expedited claims processing."
    )
    pdf.multi_cell(0, 10, actuarial_text)
    pdf.ln(5)

    # Section 3: Risk Indicators (Table)
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, '3. DETECTED RISK INDICATORS', 0, 1, 'L')
    pdf.set_font('Arial', '', 11)
    for alert in heuristic_results['alerts']:
        pdf.cell(0, 8, f"- [ALERT]: {alert}", 0, 1, 'L')
    pdf.ln(5)

    # Section 3: Technical Evidence
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, '3. FORENSIC EVIDENCE', 0, 1, 'L')
    pdf.set_font('Arial', '', 11)
    
    # Comparison Table Mockup
    pdf.cell(40, 10, 'Field', 1)
    pdf.cell(70, 10, 'Expected (Ground Truth)', 1)
    pdf.cell(70, 10, 'Extracted (Fraud Bill)', 1)
    pdf.ln()
    
    pdf.cell(40, 10, 'Bank Hash', 1)
    pdf.cell(70, 10, 'HASH_CF_001', 1)
    pdf.cell(70, 10, str(vendor_data.get('bank_hash', 'N/A')), 1) 
    pdf.ln()
    
    pdf.cell(40, 10, 'Total Amount', 1)
    pdf.cell(70, 10, '$1,043.00 (Avg)', 1)
    pdf.cell(70, 10, f"${vendor_data.get('total_amount', 0)}", 1)
    pdf.ln(10)

    # Final Verdict
    pdf.set_font('Arial', 'B', 12)
    pdf.set_fill_color(255, 204, 204)
    pdf.cell(0, 10, f'VERDICT: {heuristic_results["status"]}', 0, 1, 'C', True)

    pdf.output(filename)
    print(f"✅ Report successfully saved as {filename}")

# --- EXAMPLE USAGE ---
if __name__ == "__main__":
    mock_vendor = {"vendor_name": "CloudFlare", "bank_hash": "GB89 1234...", "total_amount": 26500}
    mock_results = {
        "score": 95, 
        "status": "CRITICAL FRAUD PROBABLE", 
        "alerts": [
            "Critical: Bank details mismatch.",
            "Anomaly: Bill amount is 25x above average.",
            "Warning: High-pressure urgency keywords found."
        ]
    }
    create_pdf_report(mock_vendor, mock_results)
