# Script para ejecutar migraciones de la base de datos
$projectPath = "$PSScriptRoot\..\src\LoveRose.API"
$startupProject = "$PSScriptRoot\..\src\LoveRose.API"
$context = "ApplicationDbContext"

# Restaurar paquetes
dotnet restore $projectPath

# Crear migración (si no existe)
$migrationName = Read-Host "Ingrese el nombre de la migración (ej: InitialCreate)"
if ($migrationName) {
    Write-Host "Creando migración: $migrationName" -ForegroundColor Cyan
    dotnet ef migrations add $migrationName --project $projectPath --startup-project $startupProject --context $context
}

# Aplicar migraciones
Write-Host "Aplicando migraciones..." -ForegroundColor Cyan
dotnet ef database update --project $projectPath --startup-project $startupProject --context $context

Write-Host "¡Migración completada con éxito!" -ForegroundColor Green
