import requests

url = "http://localhost:8000/api/v1/onboard-bill"
files = {'file': ('invoice_high.pdf', b'dummy content', 'application/pdf')}

print(f"🚀 Attempting Upload to {url}...")
try:
    response = requests.post(url, files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"❌ Connection Failed: {e}")
