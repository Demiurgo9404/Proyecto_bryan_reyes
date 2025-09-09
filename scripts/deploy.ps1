# LoveRose Complete Deployment Script

Write-Host "=== LoveRose Complete Deployment ===" -ForegroundColor Green
Write-Host "Starting deployment process..." -ForegroundColor Yellow

# Step 1: Build and Test
Write-Host "
1. Building and testing application..." -ForegroundColor Cyan
cd src
dotnet restore
if (0 -ne 0) {
    Write-Host "Restore failed" -ForegroundColor Red
    exit 1
}

dotnet build
if (0 -ne 0) {
    Write-Host "Build failed" -ForegroundColor Red
    exit 1
}

dotnet test
if (0 -ne 0) {
    Write-Host "Tests failed" -ForegroundColor Red
    exit 1
}

Write-Host "Build and tests completed successfully" -ForegroundColor Green

# Step 2: Database Setup
Write-Host "
2. Setting up database..." -ForegroundColor Cyan
cd ..
Write-Host "Please ensure PostgreSQL is running and execute the following command:" -ForegroundColor Yellow
Write-Host "psql -U userloverose -h localhost -d postgres -f scripts/setup-database.sql" -ForegroundColor White

# Step 3: Environment Configuration
Write-Host "
3. Environment configuration..." -ForegroundColor Cyan
Write-Host "Copy production environment variables:" -ForegroundColor Yellow
Write-Host "cp scripts/production.env .env" -ForegroundColor White

# Step 4: Start Application
Write-Host "
4. Starting LoveRose API..." -ForegroundColor Cyan
cd src
Write-Host "Starting API server..." -ForegroundColor Yellow
Write-Host "API will be available at:" -ForegroundColor Green
Write-Host "  - HTTP: http://localhost:5000" -ForegroundColor White
Write-Host "  - HTTPS: https://localhost:7000" -ForegroundColor White
Write-Host "  - Swagger: https://localhost:7000/swagger" -ForegroundColor White
Write-Host "  - Health: https://localhost:7000/health" -ForegroundColor White
Write-Host "  - Metrics: https://localhost:7000/api/performance/stats" -ForegroundColor White

Write-Host "
Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "Starting server..." -ForegroundColor Green

dotnet run --project LoveRose.API
