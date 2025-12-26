import requests
import time
import threading

def attack():
    print("🚀 Launching DDoS flood (50 requests)...")
    url = "http://localhost:8000/health"
    
    def send_req():
        try:
            # We don't care about the response, just hitting the server
            requests.get(url, timeout=1)
        except Exception as e:
            pass

    threads = []
    # Threshold is 20 req/sec. We send 100 to be sure.
    for _ in range(100): 
        t = threading.Thread(target=send_req)
        threads.append(t)
        t.start()
    
    for t in threads:
        t.join()
    print("✅ Attack traffic sent.")

print("⏳ Waiting 8 seconds for Browser to initialize...")
time.sleep(8)
attack()
