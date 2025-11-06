# Expense Tracker Startup Script
Write-Host "🚀 Starting Expense Tracker..." -ForegroundColor Cyan
Write-Host ""

# Check if backend dependencies are installed
if (-not (Test-Path "server\node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location server
    npm install
    Set-Location ..
    Write-Host "✅ Backend dependencies installed!" -ForegroundColor Green
    Write-Host ""
}

# Start backend server in new window
Write-Host "🔧 Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\server'; Write-Host '🚀 Backend Server' -ForegroundColor Cyan; npm start"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend in new window
Write-Host "🎨 Starting frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '🎨 Frontend Dev Server' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "✅ Application starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Two new windows will open:" -ForegroundColor Cyan
Write-Host "   1. Backend Server (http://localhost:5000)" -ForegroundColor White
Write-Host "   2. Frontend Dev Server (http://localhost:5173)" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Open http://localhost:5173 in your browser" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
