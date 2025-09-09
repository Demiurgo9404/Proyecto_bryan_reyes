# Script de instalación de dependencias para LoveRose
# Versión: 1.1
# Descripción: Instala todas las dependencias necesarias para el frontend y backend

# Configuración
$ErrorActionPreference = "Stop"
$baseDir = Split-Path -Parent $PSScriptRoot

# Colores para la salida
$successColor = "Green"
$warningColor = "Yellow"
$errorColor = "Red"
$infoColor = "Cyan"

# Función para escribir mensajes con formato
function Write-Status {
    param(
        [string]$message,
        [string]$status = "INFO"
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $statusText = "[$timestamp] [$status]"
    
    switch ($status.ToUpper()) {
        "SUCCESS" { $color = $successColor }
        "WARN" { $color = $warningColor }
        "ERROR" { $color = $errorColor }
        default { $color = $infoColor }
    }
    
    Write-Host "$statusText $message" -ForegroundColor $color
}

# Función para verificar si un comando existe
function Test-CommandExists {
    param($command)
    $exists = $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
    return $exists
}

# Función para instalar Node.js si no está instalado
function Install-NodeJS {
    if (-not (Test-CommandExists "node")) {
        Write-Status "Node.js no encontrado. Instalando..." "WARN"
        
        if (Test-CommandExists "winget") {
            winget install OpenJS.NodeJS.LTS
        } 
        else {
            $nodeUrl = "https://nodejs.org/dist/v18.17.1/node-v18.17.1-x64.msi"
            $installerPath = "$env:TEMP\nodejs_installer.msi"
            
            Write-Status "Descargando Node.js..."
            Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath
            
            Write-Status "Instalando Node.js..."
            Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", "`"$installerPath`"", "/qn" -Wait
            
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        }
        
        Write-Status "Node.js instalado correctamente" "SUCCESS"
    } else {
        $nodeVersion = node --version
        Write-Status "Node.js ya está instalado (Versión: $nodeVersion)" "SUCCESS"
    }
}

# Función para instalar .NET SDK si no está instalado
function Install-DotNetSDK {
    if (-not (Test-CommandExists "dotnet")) {
        Write-Status ".NET SDK no encontrado. Instalando..." "WARN"
        
        if (Test-CommandExists "winget") {
            winget install Microsoft.DotNet.SDK.7
        }
        else {
            $dotnetUrl = "https://download.visualstudio.microsoft.com/download/pr/5e1a0a12-0f7f-4e59-9ed1-4a9cbf2400a3/0c2cf885b91e9e224007b2e4c5bcd45b/dotnet-sdk-7.0.400-win-x64.exe"
            $installerPath = "$env:TEMP\dotnet-sdk-installer.exe"
            
            Write-Status "Descargando .NET SDK..."
            Invoke-WebRequest -Uri $dotnetUrl -OutFile $installerPath
            
            Write-Status "Instalando .NET SDK..."
            Start-Process -FilePath $installerPath -ArgumentList "/install", "/quiet", "/norestart" -Wait
            
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        }
        
        Write-Status ".NET SDK instalado correctamente" "SUCCESS"
    } else {
        $dotnetVersion = dotnet --version
        Write-Status ".NET SDK ya está instalado (Versión: $dotnetVersion)" "SUCCESS"
    }
}

# Función para instalar dependencias del frontend
function Install-FrontendDependencies {
    param([string]$path = "$baseDir\frontend")
    
    if (-not (Test-Path $path)) {
        Write-Status "Directorio de frontend no encontrado en $path" "WARN"
        return $false
    }
    
    Write-Status "Instalando dependencias del frontend..."
    
    try {
        Set-Location $path
        
        if (-not (Test-Path "package.json")) {
            Write-Status "No se encontró package.json en $path" "ERROR"
            return $false
        }
        
        Write-Status "Ejecutando npm install..."
        npm install --no-fund --no-audit --prefer-offline
        
        if ((Get-Content "package.json" | ConvertFrom-Json).scripts.postinstall) {
            Write-Status "Ejecutando postinstall scripts..."
            npm run postinstall --if-present
        }
        
        Write-Status "Dependencias del frontend instaladas correctamente" "SUCCESS"
        return $true
    }
    catch {
        Write-Status "Error al instalar dependencias del frontend: $_" "ERROR"
        return $false
    }
    finally {
        Set-Location $baseDir
    }
}

# Función para instalar dependencias del backend
function Install-BackendDependencies {
    param([string]$path = "$baseDir\backend")
    
    if (-not (Test-Path $path)) {
        Write-Status "Directorio de backend no encontrado en $path" "WARN"
        return $false
    }
    
    Write-Status "Instalando dependencias del backend..."
    
    try {
        Set-Location $path
        
        if (Test-Path "package.json") {
            Write-Status "Instalando dependencias de Node.js..."
            npm install --no-fund --no-audit --prefer-offline
            
            if (Test-Path "package-lock.json") {
                npm ci --only=dev --no-fund --no-audit --prefer-offline
            }
        }
        
        $csprojFiles = Get-ChildItem -Path $path -Filter "*.csproj" -Recurse
        if ($csprojFiles) {
            Write-Status "Restaurando paquetes NuGet..."
            dotnet restore
            
            $tools = @("dotnet-ef")
            foreach ($tool in $tools) {
                if (-not (dotnet tool list --global | Select-String $tool)) {
                    Write-Status "Instalando herramienta global: $tool"
                    dotnet tool install --global $tool
                }
            }
        }
        
        Write-Status "Dependencias del backend instaladas correctamente" "SUCCESS"
        return $true
    }
    catch {
        Write-Status "Error al instalar dependencias del backend: $_" "ERROR"
        return $false
    }
    finally {
        Set-Location $baseDir
    }
}

# Función principal
function Start-Installation {
    [CmdletBinding()]
    param(
        [switch]$SkipNodeInstall,
        [switch]$SkipDotNetInstall,
        [switch]$SkipFrontend,
        [switch]$SkipBackend,
        [string]$FrontendPath,
        [string]$BackendPath
    )
    
    Write-Host "=== INSTALACIÓN DE DEPENDENCIAS LOVEROSE ===" -ForegroundColor Magenta
    
    try {
        # Instalar requisitos previos
        if (-not $SkipNodeInstall) { Install-NodeJS }
        if (-not $SkipDotNetInstall) { Install-DotNetSDK }
        
        # Instalar dependencias del frontend
        $frontendResult = $true
        if (-not $SkipFrontend) {
            $frontendPathToUse = if ($FrontendPath) { $FrontendPath } else { "$baseDir\frontend" }
            $frontendResult = Install-FrontendDependencies -path $frontendPathToUse
        }
        
        # Instalar dependencias del backend
        $backendResult = $true
        if (-not $SkipBackend) {
            $backendPathToUse = if ($BackendPath) { $BackendPath } else { "$baseDir\backend" }
            $backendResult = Install-BackendDependencies -path $backendPathToUse
        }
        
        # Mostrar resumen
        Write-Host "`n=== RESUMEN DE INSTALACIÓN ===" -ForegroundColor Cyan
        if ($frontendResult -and $backendResult) {
            Write-Status "Instalación completada exitosamente" "SUCCESS"
            return 0
        } else {
            Write-Status "Hubo problemas durante la instalación. Revisa los mensajes anteriores." "ERROR"
            return 1
        }
    }
    catch {
        Write-Status "Error inesperado: $_" "ERROR"
        Write-Status "Stack Trace: $($_.ScriptStackTrace)" "ERROR"
        return 1
    }
}

# Ejecutar instalación
try {
    exit (Start-Installation @args)
}
catch {
    Write-Host "Error al ejecutar el script: $_" -ForegroundColor Red
    exit 1
}