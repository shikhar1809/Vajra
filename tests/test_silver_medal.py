# import pytest (Removed to avoid dependency issues if not installed)
import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_health_check():
    """Verify backend is reachable."""
    resp = requests.get(f"{BASE_URL}/health")
    assert resp.status_code == 200
    assert "fortress_mode" in resp.json()

def test_financial_fraud_logic():
    """
    Simulate uploading a high-value bill to trigger Susness Logic.
    """
    # Create valid dummy file
    files = {'file': ('invoice_high_value.pdf', b'dummy content')}
    
    resp = requests.post(f"{BASE_URL}/api/v1/onboard-bill", files=files)
    assert resp.status_code == 200
    data = resp.json()
    
    # Assertions based on our mocked logic for 'high' filename
    assert data["vendor_name"] == "CloudFlare"
    assert data["bill_amount"] == 12500.0
    assert data["is_sus"] == True
    assert data["susness_score"] >= 90
    print("\n[SUCCESS] Financial Fraud Logic Detected High Susness Transaction!")

def test_fortress_mode_enforcement():
    """
    Toggle Fortress Mode ON and verify write operations fail.
    """
    # 1. Enable Fortress
    requests.post(f"{BASE_URL}/api/v1/fortress-mode?enable=true")
    
    # 2. Try to Onboard Bill (Write Op)
    files = {'file': ('invoice_test.pdf', b'dummy')}
    resp = requests.post(f"{BASE_URL}/api/v1/onboard-bill", files=files)
    
    # 3. Assert 503 or 403 (Middleware catches it as 503)
    assert resp.status_code == 503
    assert "SHIELD_ACTIVE" in resp.json()["detail"]
    print("\n[SUCCESS] Fortress Mode successfully blocked write operation!")
    
    # 4. Disable Fortress Cleanup
    requests.post(f"{BASE_URL}/api/v1/fortress-mode?enable=false")

if __name__ == "__main__":
    # Rudimentary runner if pytest not installed, but we prefer pytest
    try:
        test_health_check()
        test_financial_fraud_logic()
        test_fortress_mode_enforcement()
        print("\nALL TESTS PASSED")
    except AssertionError as e:
        print(f"\nTEST FAILED: {e}")
