# Medical Pharmacy Chatbot - Startup Script
# Starts the backend server and waits for it to be ready

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "╔════════════════════════════════════════╗"
Write-Host "║ Medical Pharmacy Chatbot - Startup    ║"
Write-Host "╚════════════════════════════════════════╝"
Write-Host ""

$BackEndPath = Join-Path $PSScriptRoot "BackEnd"

# Check if we're in the right directory
if (-not (Test-Path (Join-Path $BackEndPath ".env"))) {
    Write-Host "❌ ERROR: .env file not found in BackEnd folder" -ForegroundColor Red
    Write-Host "   Expected: $BackEndPath\.env"
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Environment configuration found"
Write-Host ""

# Navigate to BackEnd folder
Set-Location $BackEndPath

Write-Host "🚀 Starting Medical Pharmacy Chatbot Backend..."
Write-Host ""

# Start the server
$process = Start-Process -FilePath "node" -ArgumentList "src/server.js" -PassThru -NoNewWindow

Write-Host "⏳ Waiting for server to be ready..."

# Wait for server to respond
$maxWaitTime = 15
$elapsed = 0
$ready = $false

while ($elapsed -lt $maxWaitTime) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $ready = $true
            break
        }
    }
    catch {
        # Server not ready yet
    }
    
    Write-Host "." -NoNewline
    Start-Sleep -Milliseconds 500
    $elapsed += 0.5
}

Write-Host ""
Write-Host ""

if ($ready) {
    Write-Host "✅ Server is running and ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Server Information:" -ForegroundColor Cyan
    Write-Host "   URL: http://localhost:5000"
    Write-Host "   Health Check: http://localhost:5000/health"
    Write-Host "   Process ID: $($process.Id)"
    Write-Host ""
    Write-Host "🔗 API Endpoints:" -ForegroundColor Cyan
    Write-Host "   Chat: POST http://localhost:5000/api/agent/chat"
    Write-Host "   Alt:  POST http://localhost:5000/api/chat/chat"
    Write-Host ""
    Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Keep this window open (server is running)"
    Write-Host "   2. Open new terminal: cd FrontEnd && npm run dev"
    Write-Host "   3. Go to http://localhost:5173 in browser"
    Write-Host "   4. Start chatting with the medical chatbot!"
    Write-Host ""
    Write-Host "📝 Try these queries:" -ForegroundColor Yellow
    Write-Host "   ✅ 'What is the price of paracetamol?'"
    Write-Host "   ✅ 'What is the dosage for ibuprofen?'"
    Write-Host "   ✅ 'I have a fever, what medicine?'"
    Write-Host "   ❌ 'What is the capital of France?' (rejected)"
    Write-Host ""
    Write-Host "⛔ To stop: Press Ctrl+C"
    Write-Host ""
    
    # Keep the process running
    Wait-Process -InputObject $process
}
else {
    Write-Host "❌ Server failed to start within $maxWaitTime seconds" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Check if PostgreSQL is running"
    Write-Host "  2. Verify .env file has correct database credentials"
    Write-Host "  3. Check if port 5000 is available"
    Write-Host "  4. Run: node seed-medicines.js to setup database"
    Write-Host ""
    
    # Kill the process if it's still running
    if ($process -and -not $process.HasExited) {
        $process | Stop-Process -Force
    }
    
    Read-Host "Press Enter to exit"
    exit 1
}
