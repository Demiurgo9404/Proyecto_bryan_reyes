# Script de configuración de base de datos para LoveRose
# Este script ejecutará el archivo SQL para crear la base de datos y todas las tablas necesarias

# Configuración
$env:PGPASSWORD = 'Roximar2025'
$psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
$hostname = "localhost"
$port = 5432
$username = "postgres"
$database = "postgres"

# Verificar si psql.exe existe
if (-not (Test-Path $psqlPath)) {
    Write-Host "❌ No se encontró psql.exe en la ruta esperada: $psqlPath" -ForegroundColor Red
    Write-Host "Por favor, verifica que PostgreSQL esté instalado correctamente." -ForegroundColor Yellow
    exit 1
}

Write-Host "=== Configuración de Base de Datos LoveRose ===" -ForegroundColor Cyan
Write-Host "Host: $hostname"
Write-Host "Puerto: $port"
Write-Host "Usuario: $username"
Write-Host "Ruta a psql: $psqlPath"

# Verificar conexión al servidor PostgreSQL
Write-Host "`n🔍 Verificando conexión al servidor PostgreSQL..." -ForegroundColor Yellow
$testConnection = & $psqlPath -h $hostname -p $port -U $username -d $database -t -c "SELECT '✅ Conexión exitosa a PostgreSQL' AS message;" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ No se pudo conectar al servidor PostgreSQL" -ForegroundColor Red
    Write-Host "Error: $testConnection" -ForegroundColor Red
    Write-Host "`n🔧 Solución de problemas:" -ForegroundColor Yellow
    Write-Host "1. Verifica que el servicio de PostgreSQL esté en ejecución"
    Write-Host "2. Confirma que el usuario y contraseña sean correctos"
    Write-Host "3. Asegúrate de que el puerto $port esté abierto en el firewall"
    Write-Host "4. Verifica que el usuario 'postgres' tenga permisos para crear bases de datos"
    exit 1
}

Write-Host $testConnection -ForegroundColor Green

# Ejecutar el script SQL
$scriptPath = Join-Path $PSScriptRoot "setup-database.sql"

if (-not (Test-Path $scriptPath)) {
    Write-Host "❌ No se encontró el archivo de script SQL: $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "`n🚀 Ejecutando script de configuración de la base de datos..." -ForegroundColor Yellow

# Ejecutar el script SQL
$output = & $psqlPath -h $hostname -p $port -U $username -d $database -f $scriptPath -v ON_ERROR_STOP=1 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al ejecutar el script SQL" -ForegroundColor Red
    Write-Host "Error: $output" -ForegroundColor Red
    exit 1
}

# Verificar que la base de datos se creó correctamente
$dbCheck = & $psqlPath -h $hostname -p $port -U $username -d "love_rose_db" -t -c "SELECT '✅ Base de datos love_rose_db verificada correctamente' AS message;" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ No se pudo verificar la base de datos love_rose_db" -ForegroundColor Red
    Write-Host "Error: $dbCheck" -ForegroundColor Red
    exit 1
}

Write-Host $dbCheck -ForegroundColor Green

# Verificar tablas creadas
Write-Host "`n📊 Tablas creadas en la base de datos:" -ForegroundColor Cyan
$tables = & $psqlPath -h $hostname -p $port -U $username -d "love_rose_db" -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" 2>&1

if ($LASTEXITCODE -eq 0) {
    $tables | ForEach-Object { 
        if ($_.Trim()) { 
            Write-Host "- $($_.Trim())" 
        } 
    }
} else {
    Write-Host "No se pudieron listar las tablas: $tables" -ForegroundColor Yellow
}

# Verificar datos de ejemplo
Write-Host "`n👥 Usuarios creados:" -ForegroundColor Cyan
$users = & $psqlPath -h $hostname -p $port -U $username -d "love_rose_db" -t -c "SELECT id, username, email, role_id FROM users;" 2>&1

if ($LASTEXITCODE -eq 0) {
    $users | ForEach-Object { 
        if ($_.Trim()) { 
            Write-Host "- $($_.Trim())" 
        } 
    }
}

Write-Host "`n🎁 Productos creados:" -ForegroundColor Cyan
$products = & $psqlPath -h $hostname -p $port -U $username -d "love_rose_db" -t -c "SELECT id, name, coins, price FROM products;" 2>&1

if ($LASTEXITCODE -eq 0) {
    $products | ForEach-Object { 
        if ($_.Trim()) { 
            Write-Host "- $($_.Trim())" 
        } 
    }
}

# Mensaje de finalización exitosa
Write-Host "`n✨ Configuración completada exitosamente!" -ForegroundColor Green
Write-Host "La base de datos 'love_rose_db' está lista para ser utilizada con las dashboards." -ForegroundColor Green
Write-Host "`n🔑 Credenciales por defecto:" -ForegroundColor Yellow
Write-Host "- Usuario: admin"
Write-Host "- Contraseña: Admin123!"
Write-Host "- Correo: admin@loverose.com"

# Limpiar la contraseña de las variables de entorno
$env:PGPASSWORD = $null
