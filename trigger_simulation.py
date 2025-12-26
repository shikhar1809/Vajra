import requests
import time
import subprocess
import threading

def trigger_attack():
    print("⏳ Waiting 10s for Browser to initialize...")
    time.sleep(10)
    print("🚀 Triggering Manual Simulation...")
    try:
        res = requests.post("http://localhost:8000/api/v1/threats/simulate")
        print(f"✅ Trigger Status: {res.status_code}")
        print(res.json())
    except Exception as e:
        print(f"❌ Failed to trigger: {e}")

# Run in blocking mode for this script
trigger_attack()
