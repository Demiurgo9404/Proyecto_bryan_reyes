# LoveRose Development Setup Script

Write-Host "Setting up LoveRose development environment..." -ForegroundColor Green

# Check if PostgreSQL is running
Write-Host "Checking PostgreSQL connection..." -ForegroundColor Yellow
try {
     = psql -U userloverose -h localhost -d postgres -c "SELECT version();" 2>
    if (0 -eq 0) {
        Write-Host "PostgreSQL is running" -ForegroundColor Green
    } else {
        Write-Host "PostgreSQL is not running. Please start PostgreSQL service." -ForegroundColor Red
        Write-Host "You can start it with: net start postgresql-x64-13" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "PostgreSQL is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install PostgreSQL and add it to your PATH" -ForegroundColor Yellow
    exit 1
}

# Create database
Write-Host "Creating LoveRose database..." -ForegroundColor Yellow
try {
    psql -U userloverose -h localhost -d postgres -c "CREATE DATABASE LoveRoseDB;" 2>
    Write-Host "Database created successfully" -ForegroundColor Green
} catch {
    Write-Host "Database might already exist, continuing..." -ForegroundColor Yellow
}

# Run database setup script
Write-Host "Running database setup script..." -ForegroundColor Yellow
try {
    psql -U userloverose -h localhost -d LoveRoseDB -f scripts/setup-database.sql
    Write-Host "Database setup completed successfully" -ForegroundColor Green
} catch {
    Write-Host "Error running database setup script" -ForegroundColor Red
    Write-Host "Please check the script and database connection" -ForegroundColor Yellow
    exit 1
}

# Build the project
Write-Host "Building LoveRose project..." -ForegroundColor Yellow
cd src
dotnet build
if (0 -eq 0) {
    Write-Host "Project built successfully" -ForegroundColor Green
} else {
    Write-Host "Build failed" -ForegroundColor Red
    exit 1
}

# Run tests
Write-Host "Running tests..." -ForegroundColor Yellow
dotnet test
if (0 -eq 0) {
    Write-Host "All tests passed" -ForegroundColor Green
} else {
    Write-Host "Some tests failed" -ForegroundColor Red
}

# Start the API
Write-Host "Starting LoveRose API..." -ForegroundColor Yellow
Write-Host "API will be available at: https://localhost:7000" -ForegroundColor Cyan
Write-Host "Swagger UI will be available at: https://localhost:7000/swagger" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow

dotnet run --project LoveRose.API
