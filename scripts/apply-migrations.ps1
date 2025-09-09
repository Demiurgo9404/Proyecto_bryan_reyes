# Apply Database Migrations Script
# This script applies database migrations for the LoveRose application

param (
    [string]$Environment = "Development",
    [switch]$UpdateDatabase = $true,
    [switch]$SeedData = $false
)

$ErrorActionPreference = "Stop"
$projectPath = "$PSScriptRoot\..\src\LoveRose.API"
$startupProject = "$projectPath\LoveRose.API.csproj"
$migrationsProject = "$PSScriptRoot\..\src\LoveRose.Infrastructure\LoveRose.Infrastructure.csproj"

Write-Host "=== LoveRose Database Migration Tool ===" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow

# Check if dotnet-ef is installed
$efInstalled = dotnet tool list --global | Select-String "dotnet-ef"
if (-not $efInstalled) {
    Write-Host "Installing dotnet-ef tool..." -ForegroundColor Yellow
    dotnet tool install --global dotnet-ef
}

try {
    # Restore packages
    Write-Host "Restoring packages..." -ForegroundColor Cyan
    dotnet restore "$PSScriptRoot\..\LoveRose.sln"
    
    # Build the solution
    Write-Host "Building solution..." -ForegroundColor Cyan
    dotnet build "$PSScriptRoot\..\LoveRose.sln" -c Release --no-restore
    
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed. Please check the build errors and try again."
    }
    
    # Apply migrations if requested
    if ($UpdateDatabase) {
        Write-Host "Applying database migrations..." -ForegroundColor Cyan
        $env:ASPNETCORE_ENVIRONMENT = $Environment
        
        # Create database if it doesn't exist
        Write-Host "Ensuring database exists..." -ForegroundColor Cyan
        dotnet ef database update 0 --project $migrationsProject --startup-project $startupProject --context ApplicationDbContext --no-build
        
        # Apply all migrations
        dotnet ef database update --project $migrationsProject --startup-project $startupProject --context ApplicationDbContext --no-build
        
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to apply migrations. Please check the error details above."
        }
        
        Write-Host "Database migrations applied successfully!" -ForegroundColor Green
    }
    
    # Seed data if requested
    if ($SeedData) {
        Write-Host "Seeding initial data..." -ForegroundColor Cyan
        dotnet run --project $startupProject --seed
        
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to seed data. Please check the error details above."
        }
        
        Write-Host "Initial data seeded successfully!" -ForegroundColor Green
    }
    
    Write-Host "=== Migration process completed successfully! ===" -ForegroundColor Green
}
catch {
    Write-Host "An error occurred: $_" -ForegroundColor Red
    exit 1
}
finally {
    # Clean up environment variables
    Remove-Item Env:\ASPNETCORE_ENVIRONMENT -ErrorAction SilentlyContinue
}

# Usage examples:
# .\apply-migrations.ps1 -Environment Development -UpdateDatabase -SeedData
# .\apply-migrations.ps1 -Environment Production -UpdateDatabase
