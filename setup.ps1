# Auto-Installer para LoveRose
# Este script automatiza la instalación completa del proyecto

# Configuración
$ErrorActionPreference = "Stop"
$baseDir = $PSScriptRoot
$logFile = "$env:TEMP\love_rose_setup_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

# Función para escribir en el log
function Write-Log {
    param($message, $level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$level] $message"
    Add-Content -Path $logFile -Value $logMessage -Encoding UTF8
    
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
    return [bool](Get-Command $command -ErrorAction SilentlyContinue)
}

# Función para instalar Chocolatey (gestor de paquetes para Windows)
function Install-Chocolatey {
    if (Test-CommandExists "choco") {
        Write-Log "Chocolatey ya está instalado" "SUCCESS"
        return $true
    }
    
    Write-Log "Instalando Chocolatey..." "INFO"
    try {
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        
        # Actualizar PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        
        if (Test-CommandExists "choco") {
            Write-Log "Chocolatey instalado correctamente" "SUCCESS"
            return $true
        } else {
            throw "No se pudo instalar Chocolatey"
        }
    } catch {
        Write-Log "Error al instalar Chocolatey: $_" "ERROR"
        return $false
    }
}

# Función para instalar .NET 7.0 SDK
function Install-DotNetSDK {
    if (Test-CommandExists "dotnet") {
        $version = (dotnet --version)
        if ($version -ge "7.0") {
            Write-Log ".NET SDK $version ya está instalado" "SUCCESS"
            return $true
        }
    }
    
    Write-Log "Instalando .NET 7.0 SDK..." "INFO"
    try {
        if (Test-CommandExists "choco") {
            choco install dotnet-sdk --version=7.0.400 -y
        } else {
            $installerUrl = "https://download.visualstudio.microsoft.com/download/pr/5e1a0a12-0f7f-4e59-9ed1-4a9cbf2400a3/0c2cf885b91e9e224007b2e4c5bcd45b/dotnet-sdk-7.0.400-win-x64.exe"
            $installerPath = "$env:TEMP\dotnet-sdk-installer.exe"
            
            Write-Log "Descargando instalador de .NET..."
            Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath
            
            Write-Log "Instalando .NET SDK..."
            Start-Process -FilePath $installerPath -ArgumentList "/install", "/quiet", "/norestart" -Wait -NoNewWindow
        }
        
        # Actualizar PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        
        if (Test-CommandExists "dotnet") {
            Write-Log ".NET SDK $(dotnet --version) instalado correctamente" "SUCCESS"
            return $true
        } else {
            throw "No se pudo instalar .NET SDK"
        }
    } catch {
        Write-Log "Error al instalar .NET SDK: $_" "ERROR"
        return $false
    }
}

# Función para instalar Node.js
function Install-NodeJS {
    if (Test-CommandExists "node") {
        $version = (node --version).Trim('v')
        if ($version -ge "16.0.0") {
            Write-Log "Node.js $version ya está instalado" "SUCCESS"
            return $true
        }
    }
    
    Write-Log "Instalando Node.js LTS..." "INFO"
    try {
        if (Test-CommandExists "choco") {
            choco install nodejs-lts -y
        } else {
            $nodeUrl = "https://nodejs.org/dist/v18.17.1/node-v18.17.1-x64.msi"
            $installerPath = "$env:TEMP\nodejs-installer.msi"
            
            Write-Log "Descargando Node.js..."
            Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath
            
            Write-Log "Instalando Node.js..."
            Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", "`"$installerPath`"", "/qn" -Wait -NoNewWindow
        }
        
        # Actualizar PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        
        if (Test-CommandExists "node") {
            Write-Log "Node.js $(node --version) instalado correctamente" "SUCCESS"
            return $true
        } else {
            throw "No se pudo instalar Node.js"
        }
    } catch {
        Write-Log "Error al instalar Node.js: $_" "ERROR"
        return $false
    }
}

# Función para instalar PostgreSQL
function Install-PostgreSQL {
    if (Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue) {
        Write-Log "PostgreSQL ya está instalado" "SUCCESS"
        return $true
    }
    
    Write-Log "Instalando PostgreSQL..." "INFO"
    try {
        if (Test-CommandExists "choco") {
            choco install postgresql14 --params "/Password:postgres" -y
        } else {
            $postgresUrl = "https://get.enterprisedb.com/postgresql/postgresql-14.9-1-windows-x64.exe"
            $installerPath = "$env:TEMP\postgresql-installer.exe"
            
            Write-Log "Descargando PostgreSQL..."
            Invoke-WebRequest -Uri $postgresUrl -OutFile $installerPath
            
            Write-Log "Instalando PostgreSQL..."
            $installArgs = @(
                "--mode", "unattended",
                "--superpassword", "postgres",
                "--serverport", "5432",
                "--enable-components", "commandlinetools",
                "--disable-components", "stackbuilder",
                "--debuglevel", "0"
            )
            Start-Process -FilePath $installerPath -ArgumentList $installArgs -Wait -NoNewWindow
        }
        
        # Agregar PostgreSQL al PATH
        $pgPath = "C:\Program Files\PostgreSQL\14\bin"
        if (-not ($env:Path -split ';' -contains $pgPath)) {
            [System.Environment]::SetEnvironmentVariable("Path", $env:Path + ";$pgPath", [System.EnvironmentVariableTarget]::Machine)
            $env:Path += ";$pgPath"
        }
        
        # Verificar instalación
        if (Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue) {
            Write-Log "PostgreSQL instalado correctamente" "SUCCESS"
            return $true
        } else {
            throw "No se pudo instalar PostgreSQL"
        }
    } catch {
        Write-Log "Error al instalar PostgreSQL: $_" "ERROR"
        return $false
    }
}

# Función para configurar la base de datos
function Setup-Database {
    Write-Log "Configurando la base de datos..." "INFO"
    try {
        # Verificar si el servicio está en ejecución
        $service = Get-Service -Name "postgresql*" | Where-Object { $_.Status -ne 'Running' }
        if ($service) {
            Start-Service -Name "postgresql*"
            Start-Sleep -Seconds 5
        }
        
        # Crear base de datos si no existe
        $dbExists = & psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='loverose'" 2>&1
        if (-not $dbExists) {
            Write-Log "Creando base de datos 'loverose'..." "INFO"
            & psql -U postgres -c "CREATE DATABASE loverose;" 2>&1 | Out-Null
            
            # Aplicar migraciones
            Set-Location "$baseDir\src\LoveRose.API"
            dotnet ef database update
            
            Write-Log "Base de datos configurada correctamente" "SUCCESS"
        } else {
            Write-Log "La base de datos ya existe" "INFO"
        }
        
        return $true
    } catch {
        Write-Log "Error al configurar la base de datos: $_" "ERROR"
        return $false
    }
}

# Función para instalar dependencias del frontend
function Install-FrontendDependencies {
    if (Test-Path "$baseDir\frontend") {
        Write-Log "Instalando dependencias del frontend..." "INFO"
        try {
            Set-Location "$baseDir\frontend"
            npm install --no-fund --no-audit
            Write-Log "Dependencias del frontend instaladas correctamente" "SUCCESS"
            return $true
        } catch {
            Write-Log "Error al instalar dependencias del frontend: $_" "ERROR"
            return $false
        }
    } else {
        Write-Log "No se encontró el directorio del frontend, omitiendo..." "WARN"
        return $true
    }
}

# Función principal
function Start-Installation {
    # Crear archivo de log
    "=== Inicio de instalación de LoveRose ===" | Out-File -FilePath $logFile -Encoding UTF8
    "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Out-File -FilePath $logFile -Append -Encoding UTF8
    "Usuario: $env:USERNAME" | Out-File -FilePath $logFile -Append -Encoding UTF8
    "Computadora: $env:COMPUTERNAME" | Out-File -FilePath $logFile -Append -Encoding UTF8
    "" | Out-File -FilePath $logFile -Append -Encoding UTF8
    
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "  INSTALADOR AUTOMÁTICO DE LOVERO" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "Este instalador configurará todo lo necesario" -ForegroundColor White
    Write-Host "para ejecutar la aplicación LoveRose en tu sistema." -ForegroundColor White
    Write-Host ""
    Write-Host "El registro detallado se guardará en:" -ForegroundColor White
    Write-Host $logFile -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Presiona cualquier tecla para comenzar la instalación..." -ForegroundColor White
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    # Verificar si se está ejecutando como administrador
    if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        Write-Log "Este script requiere privilegios de administrador. Por favor, ejecuta PowerShell como administrador." "ERROR"
        return $false
    }
    
    # 1. Instalar Chocolatey (gestor de paquetes)
    if (-not (Install-Chocolatey)) {
        Write-Log "No se pudo continuar sin Chocolatey" "ERROR"
        return $false
    }
    
    # 2. Instalar .NET SDK
    if (-not (Install-DotNetSDK)) {
        Write-Log "No se pudo instalar .NET SDK" "ERROR"
        return $false
    }
    
    # 3. Instalar Node.js
    if (-not (Install-NodeJS)) {
        Write-Log "No se pudo instalar Node.js" "ERROR"
        return $false
    }
    
    # 4. Instalar PostgreSQL
    if (-not (Install-PostgreSQL)) {
        Write-Log "No se pudo instalar PostgreSQL" "ERROR"
        return $false
    }
    
    # 5. Configurar base de datos
    if (-not (Setup-Database)) {
        Write-Log "No se pudo configurar la base de datos" "ERROR"
        return $false
    }
    
    # 6. Restaurar paquetes NuGet
    Write-Log "Restaurando paquetes NuGet..." "INFO"
    try {
        Set-Location "$baseDir\src"
        dotnet restore
        Write-Log "Paquetes NuGet restaurados correctamente" "SUCCESS"
    } catch {
        Write-Log "Error al restaurar paquetes NuGet: $_" "ERROR"
        return $false
    }
    
    # 7. Instalar dependencias del frontend
    if (-not (Install-FrontendDependencies)) {
        Write-Log "No se pudieron instalar las dependencias del frontend" "WARN"
    }
    
    # Mostrar resumen
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "  INSTALACIÓN COMPLETADA CON ÉXITO" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para iniciar la aplicación, sigue estos pasos:" -ForegroundColor White
    Write-Host ""
    Write-Host "1. Iniciar el backend:" -ForegroundColor Yellow
    Write-Host "   cd src\LoveRose.API" -ForegroundColor Gray
    Write-Host "   dotnet run" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. En otra terminal, iniciar el frontend:" -ForegroundColor Yellow
    Write-Host "   cd frontend" -ForegroundColor Gray
    Write-Host "   npm run dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Abre tu navegador en: http://localhost:3000" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Para más información, consulta el archivo de registro:" -ForegroundColor White
    Write-Host $logFile -ForegroundColor Yellow
    Write-Host ""
    
    return $true
}

# Punto de entrada
Start-Installation
