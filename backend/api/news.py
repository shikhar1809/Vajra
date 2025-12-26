from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date

router = APIRouter()

# --- Models ---

class ThreatAction(BaseModel):
    step: str

class ThreatAnalysis(BaseModel):
    id: str
    headline: str
    source: str
    date: str
    target_software: str
    smb_impact: str
    actions: List[str]
    severity: str # Low, Medium, High, CRITICAL
    matched_tech_stack: bool # True if SMB uses this software

class NewsFeedResponse(BaseModel):
    feed: List[ThreatAnalysis]
    last_updated: str

# --- Mock Data ---

# User's "Onboarded" Tech Stack (Demo State)
SMB_TECH_STACK = ["Google Workspace", "WordPress", "Stripe", "Slack"]

@router.get("/api/v1/news/feed", response_model=NewsFeedResponse)
async def get_threat_feed():
    """
    Simulates the 'Threat-Pulse' Active Intelligence Engine.
    1. Fetches (Mocks) RSS Feed.
    2. Runs (Mocks) Gemini 3 Pro Analysis.
    3. Matches against SMB Tech Stack.
    """
    
    # 1. Mock RSS Feed Items + 2. Mock AI Analysis (The "Cyber-Threat Intelligence Analyst" Persona)
    
    analyzed_threats = [
        {
            "id": "t1",
            "headline": "Critical Zero-Day in WordPress Elementor Plugin",
            "source": "The Hacker News",
            "date": str(date.today()),
            "target_software": "WordPress",
            "smb_impact": "If you use Elementor, attackers can take full control of your website and deface it or steal customer data.",
            "actions": [
                "Update Elementor to v3.18 immediately.",
                "Check user list for unknown admins.",
                "Enable 2FA for all WordPress admins."
            ],
            "severity": "CRITICAL",
            "matched_tech_stack": True # Matches 'WordPress' in SMB_TECH_STACK
        },
        {
            "id": "t2",
            "headline": "Google Workspace APIs Exposed to OAuth Phishing",
            "source": "Krebs on Security",
            "date": str(date.today()),
            "target_software": "Google Workspace",
            "smb_impact": "Employees could be tricked into granting malicious apps access to your company Drive and Gmail.",
            "actions": [
                "Review Connected Apps in Admin Console.",
                "Restrict API access to trusted apps only.",
                "Send phishing alert to employees."
            ],
            "severity": "High",
            "matched_tech_stack": True # Matches 'Google Workspace'
        },
        {
            "id": "t3",
            "headline": "Oracle WebLogic Server Vulnerability Detected",
            "source": "Bleeping Computer",
            "date": str(date.today()),
            "target_software": "Oracle WebLogic",
            "smb_impact": "Enterprise servers are vulnerable to remote code execution.",
            "actions": [
                "Apply Oracle Critical Patch Update.",
                "Isolate server from public internet."
            ],
            "severity": "Medium",
            "matched_tech_stack": False # SMB does not use Oracle
        },
         {
            "id": "t4",
            "headline": "Stripe Phishing Campaign Targeting Merchants",
            "source": "Dark Reading",
            "date": str(date.today()),
            "target_software": "Stripe",
            "smb_impact": "Attackers are sending fake 'Suspended Account' emails to steal banking credentials.",
            "actions": [
                "Do not click links in 'Action Required' emails.",
                "Verify account status directly on dashboard.stripe.com.",
                "Report phishing emails to support@stripe.com."
            ],
            "severity": "High",
            "matched_tech_stack": True
        }
    ]

    return NewsFeedResponse(
        feed=analyzed_threats,
        last_updated=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )

@router.post("/api/v1/news/{threat_id}/scan-assets")
async def scan_assets_for_threat(threat_id: str):
    """
    Mock action for the 'Scan My Assets' button.
    In a real app, this would trigger a specific Vuln Scan.
    """
    import asyncio
    await asyncio.sleep(2) # Simulate work
    
    # Return a mock finding
    if threat_id == "t1": # WordPress
        return {"status": "VULNERABLE", "details": "Elementor plugin is version 3.10 (Outdated). Immediate Update Required."}
    elif threat_id == "t2": # Google
        return {"status": "SAFE", "details": "No suspicious OAuth apps connected."}
    else:
        return {"status": "SAFE", "details": "Asset scan completed. No indicators found."}
