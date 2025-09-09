# Script de instalación mejorado para LoveRose
# Versión 2.1 - Corregido problema de codificación
# Guardar este archivo como UTF-8 con BOM

# Configuración
$ErrorActionPreference = "Stop"
$baseDir = $PSScriptRoot
$logFile = "$env:TEMP\love_rose_install_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

# Función para escribir en el log
function Write-Log {
    param($message, $level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$level] $message"
    Add-Content -Path $logFile -Value $logMessage -Encoding UTF8
    
    # Colores para la consola
    $color = switch ($level) {
        "SUCCESS" { "Green" }
        "WARN"    { "Yellow" }
        "ERROR"   { "Red" }
        default   { "White" }
    }
    
    Write-Host $logMessage -ForegroundColor $color
}

# Función para verificar si un comando existe
function Test-CommandExists {
    param($command)
    $exists = $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
    return $exists
}

# Función para verificar PostgreSQL
function Test-PostgreSQLConnection {
    try {
        Write-Log "Verificando conexión a PostgreSQL..."
        
        # Verificar si el servicio está en ejecución
        $postgresService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Where-Object { $_.Status -eq 'Running' }
        
        if (-not $postgresService) {
            Write-Log "El servicio de PostgreSQL no está en ejecución. Iniciando servicio..." "WARN"
            Start-Service -Name "postgresql*" -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 5
            
            $postgresService = Get-Service -Name "postgresql*" | Where-Object { $_.Status -eq 'Running' }
            if (-not $postgresService) {
                Write-Log "No se pudo iniciar el servicio de PostgreSQL" "ERROR"
                return $false
            }
        }
        
        # Verificar conexión a la base de datos
        if (Test-CommandExists "psql") {
            $result = & psql -U postgres -lqt 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Log "Conexión a PostgreSQL verificada correctamente" "SUCCESS"
                return $true
            }
        }
        
        # Si psql no está disponible, intentar con .NET
        try {
            Add-Type -Path "$baseDir\src\packages\Npgsql\lib\net6.0\Npgsql.dll" -ErrorAction SilentlyContinue
            $connectionString = "Server=localhost;Port=5432;Database=postgres;User Id=postgres;"
            $conn = New-Object Npgsql.NpgsqlConnection($connectionString)
            $conn.Open()
            $conn.Close()
            Write-Log "Conexión a PostgreSQL verificada usando .NET" "SUCCESS"
            return $true
        } catch {
            Write-Log "Error al conectar a PostgreSQL: $_" "ERROR"
            return $false
        }
    } catch {
        Write-Log "Error inesperado al verificar PostgreSQL: $_" "ERROR"
        return $false
    }
}

# Función para instalar .NET SDK
function Install-DotNetSDK {
    try {
        $dotnetVersion = dotnet --version
        Write-Log ".NET SDK $dotnetVersion ya está instalado" "SUCCESS"
        return $true
    } catch {
        Write-Log ".NET SDK no encontrado. Instalando..." "WARN"
        
        # Usar winget si está disponible
        if (Test-CommandExists "winget") {
            winget install Microsoft.DotNet.SDK.7
        } 
        # Si no hay winget, usar el instalador web
        else {
            $dotnetUrl = "https://download.visualstudio.microsoft.com/download/pr/5e1a0a12-0f7f-4e59-9ed1-4a9cbf2400a3/0c2cf885b91e9e224007b2e4c5bcd45b/dotnet-sdk-7.0.400-win-x64.exe"
            $installerPath = "$env:TEMP\dotnet-sdk-installer.exe"
            
            Write-Log "Descargando .NET SDK..."
            Invoke-WebRequest -Uri $dotnetUrl -OutFile $installerPath
            
            Write-Log "Instalando .NET SDK..."
            Start-Process -FilePath $installerPath -ArgumentList "/install", "/quiet", "/norestart" -Wait -NoNewWindow
            
            # Actualizar la variable de entorno PATH
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
            
            # Verificar la instalación
            try {
                $dotnetVersion = dotnet --version
                Write-Log ".NET SDK $dotnetVersion instalado correctamente" "SUCCESS"
                return $true
            } catch {
                Write-Log "Error al verificar la instalación de .NET SDK" "ERROR"
                return $false
            }
        }
    }
}

# Función para instalar Node.js
function Install-NodeJS {
    try {
        $nodeVersion = node --version
        Write-Log "Node.js $nodeVersion ya está instalado" "SUCCESS"
        return $true
    } catch {
        Write-Log "Node.js no encontrado. Instalando..." "WARN"
        
        # Usar winget si está disponible
        if (Test-CommandExists "winget") {
            winget install OpenJS.NodeJS.LTS
        } 
        # Si no hay winget, usar el instalador web
        else {
            $nodeUrl = "https://nodejs.org/dist/v18.17.1/node-v18.17.1-x64.msi"
            $installerPath = "$env:TEMP\nodejs_installer.msi"
            
            Write-Log "Descargando Node.js..."
            Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath
            
            Write-Log "Instalando Node.js..."
            Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", "`"$installerPath`"", "/qn" -Wait -NoNewWindow
            
            # Actualizar la variable de entorno PATH
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        }
        
        # Verificar la instalación
        try {
            $nodeVersion = node --version
            $npmVersion = npm --version
            Write-Log "Node.js $nodeVersion y npm $npmVersion instalados correctamente" "SUCCESS"
            return $true
        } catch {
            Write-Log "Error al verificar la instalación de Node.js" "ERROR"
            return $false
        }
    }
}

# Función principal de instalación
function Install-LoveRose {
    Write-Log "=== Iniciando instalación de LoveRose ==="
    
    # 1. Verificar y configurar PostgreSQL
    Write-Log "=== Verificando PostgreSQL ==="
    if (-not (Test-PostgreSQLConnection)) {
        Write-Log "No se pudo conectar a PostgreSQL. Verifica que esté instalado y en ejecución." "ERROR"
        Write-Log "Puedes descargar PostgreSQL desde: https://www.postgresql.org/download/windows/" "WARN"
        return $false
    }
    
    # 2. Instalar .NET SDK si es necesario
    Write-Log "=== Verificando .NET SDK ==="
    if (-not (Install-DotNetSDK)) {
        Write-Log "Error al instalar .NET SDK" "ERROR"
        return $false
    }
    
    # 3. Instalar Node.js si es necesario
    Write-Log "=== Verificando Node.js ==="
    if (-not (Install-NodeJS)) {
        Write-Log "Error al instalar Node.js" "ERROR"
        return $false
    }
    
    # 4. Restaurar paquetes .NET
    Write-Log "=== Restaurando paquetes .NET ==="
    try {
        Set-Location "$baseDir\src"
        dotnet restore "LoveRose.sln"
        if ($LASTEXITCODE -ne 0) {
            throw "Error al restaurar paquetes .NET"
        }
        Write-Log "Paquetes .NET restaurados correctamente" "SUCCESS"
    } catch {
        Write-Log "Error al restaurar paquetes .NET: $_" "ERROR"
        return $false
    }
    
    # 5. Aplicar migraciones
    Write-Log "=== Aplicando migraciones de base de datos ==="
    try {
        if (Test-Path "$baseDir\scripts\apply-migrations.ps1") {
            & "$baseDir\scripts\apply-migrations.ps1" -Environment "Development"
            if ($LASTEXITCODE -ne 0) {
                throw "Error al aplicar migraciones"
            }
        } else {
            Write-Log "Script de migraciones no encontrado, intentando con dotnet ef..." "WARN"
            Set-Location "$baseDir\src\LoveRose.API"
            dotnet ef database update
            if ($LASTEXITCODE -ne 0) {
                throw "Error al aplicar migraciones con dotnet ef"
            }
        }
        Write-Log "Migraciones aplicadas correctamente" "SUCCESS"
    } catch {
        Write-Log "Error al aplicar migraciones: $_" "ERROR"
        return $false
    }
    
    # 6. Instalar dependencias del frontend
    Write-Log "=== Instalando dependencias del frontend ==="
    try {
        if (Test-Path "$baseDir\frontend") {
            Set-Location "$baseDir\frontend"
            npm install --no-fund --no-audit
            if ($LASTEXITCODE -ne 0) {
                throw "Error al instalar dependencias del frontend"
            }
            Write-Log "Dependencias del frontend instaladas correctamente" "SUCCESS"
        } else {
            Write-Log "No se encontró el directorio del frontend, omitiendo..." "WARN"
        }
    } catch {
        Write-Log "Error al instalar dependencias del frontend: $_" "ERROR"
        return $false
    }
    
    Write-Log "=== Instalación completada exitosamente ===" "SUCCESS"
    return $true
}

# Ejecutar instalación
try {
    # Verificar si se está ejecutando como administrador
    $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    if (-not $isAdmin) {
        Write-Host "Este script requiere privilegios de administrador. Por favor, ejecuta PowerShell como administrador." -ForegroundColor Red
        exit 1
    }
    
    # Crear archivo de log
    "=== Log de instalación de LoveRose ===" | Out-File -FilePath $logFile -Encoding UTF8
    "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Out-File -FilePath $logFile -Append -Encoding UTF8
    "Usuario: $env:USERNAME" | Out-File -FilePath $logFile -Append -Encoding UTF8
    "Computadora: $env:COMPUTERNAME" | Out-File -FilePath $logFile -Append -Encoding UTF8
    "" | Out-File -FilePath $logFile -Append -Encoding UTF8
    
    Write-Host "Iniciando instalación de LoveRose..." -ForegroundColor Cyan
    Write-Host "El registro detallado se guardará en: $logFile" -ForegroundColor Cyan
    
    # Llamar a la función principal de instalación
    $result = Install-LoveRose
    
    if ($result) {
        Write-Host "`n✅ Instalación completada exitosamente" -ForegroundColor Green
        Write-Host "📋 Log detallado: $logFile" -ForegroundColor Cyan
        
        # Mostrar resumen de la instalación
        Write-Host "`n=== Resumen de la instalación ===" -ForegroundColor Yellow
        Write-Host "1. PostgreSQL: Verificado" -ForegroundColor Green
        Write-Host "2. .NET SDK: $(if (dotnet --version) { 'Instalado' } else { 'No instalado' })" -ForegroundColor $(if (dotnet --version) { 'Green' } else { 'Red' })
        Write-Host "3. Node.js: $(if (node --version) { 'Instalado' } else { 'No instalado' })" -ForegroundColor $(if (node --version) { 'Green' } else { 'Red' })
        Write-Host "4. Paquetes .NET: Restaurados" -ForegroundColor Green
        Write-Host "5. Migraciones: Aplicadas" -ForegroundColor Green
        Write-Host "6. Dependencias Frontend: Instaladas" -ForegroundColor Green
        
        Write-Host "`nPuedes iniciar la aplicación con los siguientes comandos:" -ForegroundColor Cyan
        Write-Host "Backend:" -ForegroundColor White
        Write-Host "   cd src\LoveRose.API" -ForegroundColor White
        Write-Host "   dotnet run" -ForegroundColor White
        Write-Host ""
        Write-Host "Frontend:" -ForegroundColor White
        Write-Host "   cd frontend" -ForegroundColor White
        Write-Host "   npm run dev" -ForegroundColor White
        
        exit 0
    } else {
        Write-Host "`n❌ Error durante la instalación. Verifica el log: $logFile" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "`n❌ Error inesperado: $_" -ForegroundColor Red
    Write-Host "📋 Log detallado: $logFile" -ForegroundColor Cyan
    exit 1
}