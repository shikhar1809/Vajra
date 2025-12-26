# Simple Attack Simulation (PowerShell 5.1 compatible)
$TARGET_URL = "http://localhost:8000"

Write-Host "ACT 1: DDoS Attack Simulation" -ForegroundColor Cyan
Write-Host "Sending 50 rapid requests to trigger rate limiting..." -ForegroundColor Yellow

# Send 50 rapid requests (enough to trigger 20 req/sec limit)
$jobs = @()
for ($i = 1; $i -le 50; $i++) {
    $jobs += Start-Job -ScriptBlock {
        param($url)
        try {
            Invoke-WebRequest -Uri "$url/health" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue | Out-Null
        }
        catch {}
    } -ArgumentList $TARGET_URL
}

# Wait for completion
$jobs | Wait-Job -Timeout 10 | Out-Null
$jobs | Remove-Job -Force

Write-Host "DONE: Check Command Center for CRITICAL threat alerts!" -ForegroundColor Green
Write-Host ""

Start-Sleep -Seconds 2

Write-Host "ACT 2: Malicious Code Analysis" -ForegroundColor Cyan
Write-Host "Analyzing vulnerable code..." -ForegroundColor Yellow

$body = @{
    code     = "import os`nos.system('rm -rf /')`nDB_PASS = 'admin123'"
    filename = "exploit.py"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$TARGET_URL/api/v1/analyze" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "Analysis Complete!" -ForegroundColor Green
    Write-Host "Status: $($response.status)" -ForegroundColor $(if ($response.status -eq "Vulnerable") { "Red" } else { "Green" })
    if ($response.findings) {
        Write-Host "Vulnerabilities Found: $($response.findings.Count)" -ForegroundColor Red
    }
}
catch {
    Write-Host "Analysis Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Simulation Complete! Open http://localhost:3000/workspace to see results." -ForegroundColor Cyan
