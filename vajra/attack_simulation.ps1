# VAJRA DDoS Attack Simulation - WORKING VERSION
# Sends concurrent requests to trigger rate limiter

Write-Host "🚨 VAJRA DDoS Attack Simulation" -ForegroundColor Red
Write-Host "================================" -ForegroundColor Red
Write-Host ""
Write-Host "Sending 30 CONCURRENT requests to exceed 20 req/sec threshold" -ForegroundColor Yellow
Write-Host "Target: http://localhost:8000/health" -ForegroundColor Yellow
Write-Host ""
Write-Host "Watch the Command Center dashboard for:" -ForegroundColor Cyan
Write-Host "  • Green flatline → Red spike" -ForegroundColor Cyan
Write-Host "  • Live Threat Stream alert" -ForegroundColor Cyan
Write-Host ""

# Countdown
3..1 | ForEach-Object { 
    Write-Host "$_..." -ForegroundColor Red
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "🔥 ATTACK INITIATED!" -ForegroundColor Red
Write-Host ""

# Create runspace pool for true concurrency
$RunspacePool = [runspacefactory]::CreateRunspacePool(1, 30)
$RunspacePool.Open()

$Jobs = @()

# Launch 30 truly concurrent requests
1..30 | ForEach-Object {
    $PowerShell = [powershell]::Create()
    $PowerShell.RunspacePool = $RunspacePool
    
    [void]$PowerShell.AddScript({
            try {
                Invoke-RestMethod -Uri "http://localhost:8000/health" -Method GET -TimeoutSec 2
            }
            catch {
                # Ignore rate limit errors
            }
        })
    
    $Jobs += [PSCustomObject]@{
        PowerShell = $PowerShell
        Handle     = $PowerShell.BeginInvoke()
    }
}

Write-Host "Sending requests..." -ForegroundColor Yellow

# Wait for all to complete
$Jobs | ForEach-Object {
    $_.PowerShell.EndInvoke($_.Handle)
    $_.PowerShell.Dispose()
}

$RunspacePool.Close()
$RunspacePool.Dispose()

Write-Host ""
Write-Host "✅ Attack complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Check the dashboard NOW - you should see:" -ForegroundColor Cyan
Write-Host "  • Red spike on heartbeat monitor" -ForegroundColor Cyan
Write-Host "  • 'DoS_ATTACK' alert in Live Threat Stream" -ForegroundColor Cyan
Write-Host "  • Severity: CRITICAL" -ForegroundColor Cyan
Write-Host ""
