# VAJRA DDoS Attack - Simple Working Version
Write-Host "`n🚨 VAJRA DDoS Attack Simulation" -ForegroundColor Red
Write-Host "Sending 30 concurrent requests..." -ForegroundColor Yellow
Write-Host "Watch the Command Center dashboard!`n" -ForegroundColor Cyan

# Launch 30 background jobs
$jobs = 1..30 | ForEach-Object { 
    Start-Job -ScriptBlock { 
        try { Invoke-RestMethod http://localhost:8000/health } 
        catch { }
    } 
}

# Wait and cleanup
$jobs | Wait-Job -Timeout 5 | Out-Null
$jobs | Remove-Job -Force

Write-Host "✅ Attack complete! Check dashboard for alerts.`n" -ForegroundColor Green
