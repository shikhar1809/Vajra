
import sys
import os

log_path = r'c:\Users\royal\Desktop\Vajra_AntiGravity\build_log_2.txt'

if not os.path.exists(log_path):
    print("Log file not found")
    sys.exit(1)

try:
    with open(log_path, 'r', encoding='utf-16-le') as f:
        content = f.read()
except Exception as e:
    print(f"UTF-16-LE failed: {e}")
    try:
        with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception as e2:
        print(f"UTF-8 failed: {e2}")
        sys.exit(1)

print(f"Read {len(content)} chars")

lines = content.splitlines()
found_error = False
for i, line in enumerate(lines):
    if "Error:" in line or "Failed to compile" in line or "Type error:" in line:
        found_error = True
        print(f"MATCH at line {i}: {line}")
        # Print context
        start = max(0, i-10)
        end = min(len(lines), i+10)
        for j in range(start, end):
             print(f"  {lines[j]}")
        print("-" * 20)

if not found_error:
    print("No explicit error found in logs. Printing last 50 lines:")
    for line in lines[-50:]:
        print(line)
