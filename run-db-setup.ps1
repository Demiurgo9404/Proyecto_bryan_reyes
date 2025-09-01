Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    FIXING LOVEROSE DATABASE TABLES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project directory
Set-Location "c:\Users\Demiurgo\Documents\GitHub\love_rose"
Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Yellow

# Run database setup
Write-Host "🔧 Running database setup script..." -ForegroundColor Green
node scripts/setup-database-fixed.js

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    SETUP COMPLETED" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart backend: npm start" -ForegroundColor White
Write-Host "2. Test login with: admin@loverose.com / password123" -ForegroundColor White

Read-Host "Press Enter to continue"
