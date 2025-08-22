# Script de diagnóstico mejorado para PostgreSQL

Write-Host "=== Diagnóstico de PostgreSQL ===`n" -ForegroundColor Cyan

# 1. Verificar si el servicio está instalado
$service = Get-Service -Name "postgresql-*" -ErrorAction SilentlyContinue

if (-not $service) {
    Write-Host "❌ No se encontró ningún servicio de PostgreSQL instalado" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Servicio PostgreSQL encontrado: $($service.DisplayName) (Estado: $($service.Status))"

# 2. Verificar estado del servicio
if ($service.Status -ne "Running") {
    Write-Host "⚠️  El servicio no está en ejecución. Intentando iniciar..." -ForegroundColor Yellow
    try {
        Start-Service -Name $service.Name -ErrorAction Stop
        Write-Host "✅ Servicio iniciado correctamente" -ForegroundColor Green
    } catch {
        Write-Host "❌ No se pudo iniciar el servicio: $_" -ForegroundColor Red
    }
}

# 3. Verificar puerto
Write-Host "`n=== Verificación de puerto 5432 ==="
$portCheck = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue

if ($portCheck.TcpTestSucceeded) {
    Write-Host "✅ El puerto 5432 está abierto y aceptando conexiones" -ForegroundColor Green
} else {
    Write-Host "❌ No se puede conectar al puerto 5432" -ForegroundColor Red
    Write-Host "   Verifica que PostgreSQL esté configurado para escuchar en todas las interfaces"
}

# 4. Verificar configuración de conexión
Write-Host "`n=== Configuración de conexión ==="
$pgHbaPath = "C:\Program Files\PostgreSQL\17\data\pg_hba.conf"

if (Test-Path $pgHbaPath) {
    $hbaContent = Get-Content $pgHbaPath -Raw
    
    Write-Host "Archivo pg_hba.conf encontrado"
    Write-Host "Configuración local: $($hbaContent -match 'local\s+all\s+all\s+trust' ? '✅' : '❌')"
    Write-Host "Configuración host (127.0.0.1): $($hbaContent -match 'host\s+all\s+all\s+127.0.0.1/32\s+trust' ? '✅' : '❌')"
    
    # Mostrar últimas 5 líneas del archivo de configuración
    Write-Host "`nÚltimas líneas de configuración:"
    Get-Content $pgHbaPath | Select-Object -Last 10
} else {
    Write-Host "❌ No se encontró el archivo pg_hba.conf" -ForegroundColor Red
}

# 5. Intentar conectar con psql
Write-Host "`n=== Prueba de conexión ==="
$env:PGPASSWORD = 'Roximar2025'

try {
    $psqlOutput = & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "SELECT version();" -h localhost 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Conexión exitosa a PostgreSQL" -ForegroundColor Green
        Write-Host $psqlOutput
    } else {
        Write-Host "❌ Error al conectar a PostgreSQL" -ForegroundColor Red
        Write-Host $psqlOutput
    }
} catch {
    Write-Host "❌ No se pudo ejecutar psql.exe: $_" -ForegroundColor Red
}

# 6. Verificar variables de entorno
Write-Host "`n=== Variables de entorno ==="
$pgPath = [System.Environment]::GetEnvironmentVariable('Path', 'Machine')
$pgInPath = $pgPath -split ';' | Where-Object { $_ -like '*PostgreSQL*' }

if ($pgInPath) {
    Write-Host "✅ PostgreSQL está en el PATH del sistema"
    Write-Host "   Ruta: $($pgInPath -join ', ')"
} else {
    Write-Host "⚠️  PostgreSQL no está en el PATH del sistema" -ForegroundColor Yellow
    Write-Host "   Agrega 'C:\Program Files\PostgreSQL\17\bin' al PATH del sistema"
}

Write-Host "`n=== Fin del diagnóstico ===" -ForegroundColor Cyan
