Write-Host "🚀 Triggering DDoS Attack Simulation on Backend API (Port 8000)..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Method POST -Uri "http://localhost:8000/api/v1/threats/simulate"
    Write-Host "✅ Success! Attack Triggered." -ForegroundColor Green
    Write-Host "👉 Check your Dashboard at http://localhost:3000/command-center" -ForegroundColor Yellow
    Write-Host "🔥 You should see a RED CRITICAL ALERT in the Live Threat Stream." -ForegroundColor Red
}
catch {
    Write-Host "❌ Failed to trigger attack." -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the Backend Server is running on Port 8000." -ForegroundColor DarkGray
}
