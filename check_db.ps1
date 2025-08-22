# Configuración
$pgBin = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
$dbName = "Love_rose_db"
$dbUser = "postgres"
$dbPassword = "1234"

# Función para ejecutar consultas SQL
function Invoke-PostgresQuery {
    param (
        [string]$query
    )
    
    try {
        $env:PGPASSWORD = $dbPassword
        & $pgBin -U $dbUser -c $query -d $dbName -t
    }
    catch {
        Write-Host "Error al ejecutar la consulta: $_" -ForegroundColor Red
    }
    finally {
        $env:PGPASSWORD = $null
    }
}

# Verificar conexión a la base de datos
Write-Host "🔍 Verificando conexión a la base de datos..." -ForegroundColor Cyan
$dbExists = Invoke-PostgresQuery "SELECT 1"

if ($dbExists -match "1") {
    Write-Host "✅ Conexión exitosa a la base de datos" -ForegroundColor Green
    
    # Verificar tablas
    Write-Host "`n📋 Tablas en la base de datos:" -ForegroundColor Cyan
    Invoke-PostgresQuery "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    
    # Verificar estructura de la tabla users
    Write-Host "`n🔍 Estructura de la tabla 'users':" -ForegroundColor Cyan
    Invoke-PostgresQuery "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'users'"
    
    # Verificar usuarios
    Write-Host "`n👥 Usuarios en la base de datos:" -ForegroundColor Cyan
    Invoke-PostgresQuery "SELECT id, email, username, role, is_verified, is_active FROM users"
    
    # Verificar usuario de prueba
    Write-Host "`n🔍 Verificando usuario de prueba..." -ForegroundColor Cyan
    $testUser = Invoke-PostgresQuery "SELECT id, email, is_verified, is_active FROM users WHERE email = 'user@loverose.com'"
    
    if ($testUser) {
        Write-Host "✅ Usuario de prueba encontrado:" -ForegroundColor Green
        $testUser
        
        # Verificar si el usuario está verificado y activo
        $userStatus = Invoke-PostgresQuery "SELECT is_verified, is_active FROM users WHERE email = 'user@loverose.com'"
        
        if ($userStatus -match "f") {
            Write-Host "`n⚠️  El usuario no está verificado o inactivo" -ForegroundColor Yellow
            
            # Preguntar si se desea actualizar el usuario
            $update = Read-Host "¿Deseas actualizar el estado del usuario? (s/n)"
            if ($update -eq "s") {
                Invoke-PostgresQuery "UPDATE users SET is_verified = true, is_active = true, updated_at = NOW() WHERE email = 'user@loverose.com'"
                Write-Host "✅ Usuario actualizado correctamente" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "❌ Usuario de prueba no encontrado" -ForegroundColor Red
        
        # Preguntar si se desea crear el usuario de prueba
        $create = Read-Host "¿Deseas crear un usuario de prueba? (s/n)"
        if ($create -eq "s") {
            # Contraseña: User123! (hasheada con bcrypt)
            $hashedPwd = "\$2a\$10\$XFDq3L7v4LdJ3H5p5n8G1OQJ1hJ3Zv5W8nUzXKjKvxY7dJ2mN3p4C"
            
            Invoke-PostgresQuery @"
                INSERT INTO users (
                    id, email, password, username, role, 
                    is_verified, is_active, created_at, updated_at
                ) VALUES (
                    '550e8400-e29b-41d4-a716-446655440000',
                    'user@loverose.com',
                    '$hashedPwd',
                    'usuario_prueba',
                    'user',
                    true,
                    true,
                    NOW(),
                    NOW()
                )
"@
            
            Write-Host "✅ Usuario de prueba creado exitosamente" -ForegroundColor Green
        }
    }
} else {
    Write-Host "❌ No se pudo conectar a la base de datos" -ForegroundColor Red
    
    # Verificar si la base de datos existe
    Write-Host "`n🔍 Verificando si la base de datos existe..." -ForegroundColor Cyan
    $dbs = & $pgBin -U $dbUser -c "SELECT datname FROM pg_database;" -t
    
    if ($dbs -match $dbName) {
        Write-Host "✅ La base de datos existe" -ForegroundColor Green
        Write-Host "Verifica la contraseña o los permisos del usuario" -ForegroundColor Yellow
    } else {
        Write-Host "❌ La base de datos no existe" -ForegroundColor Red
        
        $createDb = Read-Host "¿Deseas crear la base de datos? (s/n)"
        if ($createDb -eq "s") {
            & $pgBin -U $dbUser -c "CREATE DATABASE $dbName;"
            Write-Host "✅ Base de datos creada exitosamente" -ForegroundColor Green
        }
    }
}
