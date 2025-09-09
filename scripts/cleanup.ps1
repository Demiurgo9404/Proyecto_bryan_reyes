# Script de limpieza mejorado para LoveRose
# Versión: 3.0
# Descripción: Limpia el proyecto eliminando archivos generados, dependencias y archivos temporales
#              siguiendo la estructura de Clean Architecture y .NET Core

function Write-Info($message) {
    Write-Host "[INFO] $message" -ForegroundColor Cyan
}

function Write-Warning {
    param([string]$message)
    Write-Host "[WARN] $message" -ForegroundColor Yellow
}

function Write-Success($message) {
    Write-Host "[SUCCESS] $message" -ForegroundColor Green
}

function Invoke-SafeRemove {
    param (
        [string]$path,
        [switch]$Recurse,
        [string]$description = "archivos"
    )
    
    if (Test-Path $path) {
        try {
            $item = Get-Item $path -Force -ErrorAction Stop
            if ($item.PSIsContainer) {
                Remove-Item -Path $path -Recurse -Force -ErrorAction Stop
                Write-Info ("Eliminado directorio: {0}" -f $path)
            } else {
                Remove-Item -Path $path -Force -ErrorAction Stop
                Write-Info ("Eliminado archivo: {0}" -f $path)
            }
            return $true
        } catch {
            Write-Warning ("No se pudo eliminar {0}: {1}" -f $path, $_)
            return $false
        }
    }
    return $false
}

function Clear-NodeModules {
    Write-Info "Eliminando node_modules y archivos de paquetes..."
    @(
        "node_modules",
        "frontend\node_modules",
        "backend\node_modules",
        "Proyecto\ClientApp\node_modules",
        "frontend\temp-vite-project\node_modules"
    ) | ForEach-Object { 
        if (Invoke-SafeRemove -path $_ -Recurse -description "node_modules") {
            Write-Success "Eliminado node_modules en $_"
        }
    }
}

function Clear-BuildArtifacts {
    Write-Info "Eliminando archivos de construcción..."
    $paths = @(
        # Frontend
        "frontend\dist",
        "frontend\.vite",
        "frontend\.next",
        "frontend\build",
        "frontend\.nuxt",
        "frontend\.output",
        
        # Backend .NET
        "backend\bin",
        "backend\obj",
        "backend\publish"
    )
    
    # Eliminar directorios específicos
    foreach ($path in $paths) {
        if (Test-Path $path) {
            Invoke-SafeRemove -path $path -Recurse -description "archivos de construcción"
        }
    }
    
    # Eliminar patrones globales
    @("**/bin", "**/obj", "**/publish") | ForEach-Object {
        Get-ChildItem -Path . -Directory -Recurse -Filter $_ -ErrorAction SilentlyContinue | ForEach-Object {
            Invoke-SafeRemove -path $_.FullName -Recurse -description "archivos de construcción"
        }
    }
    
    # Eliminar archivos específicos
    @("*.sln.ide", "*.userosscache", "*.suo") | ForEach-Object {
        Get-ChildItem -Path . -File -Recurse -Filter $_ -ErrorAction SilentlyContinue | ForEach-Object {
            Invoke-SafeRemove -path $_.FullName -description "archivo de construcción"
        }
    }
}

function Clear-TemporaryFiles {
    Write-Info "Limpiando archivos temporales y caché..."
    
    # Directorios a eliminar
    @(
        ".vs", ".vscode", ".idea", ".vscode-test",
        "**/.cache", "**/.parcel-cache", "**/.eslintcache", 
        "**/.sass-cache", "**/.pnp", "**/.pnp.js",
        "**/coverage", "**/.nyc_output"
    ) | ForEach-Object {
        Get-ChildItem -Path . -Directory -Recurse -Filter $_ -ErrorAction SilentlyContinue | ForEach-Object {
            Invoke-SafeRemove -path $_.FullName -Recurse -description "archivos temporales"
        }
    }
    
    # Archivos a eliminar
    @(
        "*.tmp", "*.temp", "*.log*", "npm-debug.log*",
        "yarn-debug.log*", "yarn-error.log*", "**/.DS_Store",
        "**/Thumbs.db", "*.pdb", "*.pdb.*", "*.dll",
        "*.exe", "*.dll.config", "*.exe.config", "*.vshost.*",
        "*.iobj", "*.ipdb", "*.ilk", "*.exp", "*.lib", "*.obj"
    ) | ForEach-Object {
        Get-ChildItem -Path . -File -Recurse -Filter $_ -ErrorAction SilentlyContinue | ForEach-Object {
            Invoke-SafeRemove -path $_.FullName -description "archivo temporal"
        }
    }
}

function Clear-PackageFiles {
    Write-Info "Limpiando archivos de paquetes..."
    
    $packageFiles = @(
        "package-lock.json",
        "yarn.lock",
        "pnpm-lock.yaml"
    )
    
    $searchPaths = @(".", "frontend", "backend")
    
    foreach ($searchPath in $searchPaths) {
        if (-not (Test-Path $searchPath)) { continue }
        
        foreach ($file in $packageFiles) {
            $fullPath = Join-Path $searchPath $file
            if (Test-Path $fullPath) {
                Invoke-SafeRemove -path $fullPath -description "archivo de bloqueo"
            }
        }
    }
}

function Clear-EnvironmentFiles {
    Write-Info "Limpiando archivos de entorno..."
    Get-ChildItem -Path . -Recurse -Force -Include ".env*" -Exclude ".env.example" | ForEach-Object {
        if ($_.Name -ne ".env.example" -and $_.Name -ne ".env.local") {
            Invoke-SafeRemove -path $_.FullName -description "archivo de entorno"
        }
    }
}

function Clear-BackupFiles {
    Write-Info "Limpiando directorios de respaldo..."
    @(
        "backup_*",
        "temp-*",
        "tmp",
        "temp",
        "*.bak",
        "*.backup",
        "*.swp",
        "*.swo",
        "*~"
    ) | ForEach-Object { Invoke-SafeRemove -path $_ -Recurse -description "archivos de respaldo" }
}

function Clear-TestArtifacts {
    Write-Info "Limpiando archivos de pruebas..."
    @(
        "TestResults",
        "**/TestResults",
        "*.trx",
        "*.coverage",
        "*.coverage.*",
        "*.testlog",
        "*.testlog.*"
    ) | ForEach-Object { Invoke-SafeRemove -path $_ -Recurse -description "archivos de pruebas" }
}

function Clear-DockerArtifacts {
    Write-Info "Limpiando archivos de Docker..."
    @(
        "docker-compose.*.yml",
        "docker-compose.*.yaml",
        "**/Dockerfile.*",
        "**/docker-compose.*",
        "**/.dockerignore"
    ) | ForEach-Object { Invoke-SafeRemove -path $_ -Recurse -description "archivos de Docker" }
}

function Clear-NuGetCache {
    Write-Info "Limpiando caché de NuGet..."
    $nugetCachePaths = @(
        "$env:UserProfile\.nuget\packages",
        "$env:UserProfile\.nuget\http-cache",
        "$env:UserProfile\.nuget\v3-cache"
    )
    
    foreach ($path in $nugetCachePaths) {
        if (Test-Path $path) {
            try {
                Remove-Item -Path $path -Recurse -Force -ErrorAction Stop
                Write-Success "Caché de NuGet limpiada: $path"
            } catch {
                Write-Warning "No se pudo limpiar la caché de NuGet en $path : $_"
            }
        }
    }
}

function Clear-NPMCache {
    Write-Info "Limpiando caché de npm..."
    try {
        # Limpiar caché global de npm
        $npmCache = Join-Path $env:USERPROFILE "AppData\Roaming\npm-cache"
        if (Test-Path $npmCache) {
            Remove-Item -Path "$npmCache\_cacache" -Recurse -Force -ErrorAction SilentlyContinue
            Write-Success "Caché de npm limpiada"
        }
        
        # Limpiar caché local
        if (Get-Command -Name npm -ErrorAction SilentlyContinue) {
            $npmCommand = "npm"
        } elseif (Test-Path "$env:ProgramFiles\nodejs\npm.cmd") {
            $npmCommand = "$env:ProgramFiles\nodejs\npm.cmd"
        } else {
            Write-Warning "No se encontró el comando npm"
            return
        }
        
        # Ejecutar limpieza de caché de npm
        Start-Process -FilePath $npmCommand -ArgumentList "cache clean --force" -NoNewWindow -Wait -ErrorAction SilentlyContinue
        Write-Success "Caché global de npm limpiada"
    } catch {
        Write-Warning "Error al limpiar la caché de npm: $_"
    }
}

# Función principal
function Start-Cleanup {
    [CmdletBinding()]
    param(
        [switch]$FullClean,
        [switch]$SkipNodeModules,
        [switch]$SkipBuildArtifacts,
        [switch]$SkipTemporaryFiles,
        [switch]$SkipPackageFiles,
        [switch]$SkipEnvironmentFiles,
        [switch]$SkipBackupFiles,
        [switch]$SkipTestArtifacts,
        [switch]$SkipDockerArtifacts,
        [switch]$SkipNuGetCache,
        [switch]$SkipNPMCache
    )
    
    Write-Host "=== LIMPIEZA DEL PROYECTO LOVEROSE ===" -ForegroundColor Magenta
    Write-Host "Iniciando limpieza del proyecto..." -ForegroundColor Cyan
    
    $startTime = Get-Date
    
    # Limpieza completa si se especifica -FullClean
    if ($FullClean) {
        $SkipNodeModules = $false
        $SkipBuildArtifacts = $false
        $SkipTemporaryFiles = $false
        $SkipPackageFiles = $false
        $SkipEnvironmentFiles = $false
        $SkipBackupFiles = $false
        $SkipTestArtifacts = $false
        $SkipDockerArtifacts = $false
        $SkipNuGetCache = $false
        $SkipNPMCache = $false
    }
    
    # Ejecutar limpieza según parámetros
    if (-not $SkipNodeModules) { Clear-NodeModules }
    if (-not $SkipBuildArtifacts) { Clear-BuildArtifacts }
    if (-not $SkipTemporaryFiles) { Clear-TemporaryFiles }
    if (-not $SkipPackageFiles) { Clear-PackageFiles }
    if (-not $SkipEnvironmentFiles) { Clear-EnvironmentFiles }
    if (-not $SkipBackupFiles) { Clear-BackupFiles }
    if (-not $SkipTestArtifacts) { Clear-TestArtifacts }
    if (-not $SkipDockerArtifacts) { Clear-DockerArtifacts }
    if (-not $SkipNuGetCache) { Clear-NuGetCache }
    if (-not $SkipNPMCache) { Clear-NPMCache }
    
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    Write-Host "`n=== LIMPIEZA COMPLETADA ===" -ForegroundColor Green
    Write-Host "Tiempo total: $($duration.TotalSeconds.ToString('0.00')) segundos" -ForegroundColor Cyan
    
    # Mostrar espacio liberado (aproximado)
    $freedSpace = (Get-ChildItem -Path . -Recurse -Force -ErrorAction SilentlyContinue | 
        Where-Object { $_.PSIsContainer -eq $false } | 
        Measure-Object -Property Length -Sum).Sum / 1MB
    
    Write-Host "Espacio liberado: $($freedSpace.ToString('0.00')) MB" -ForegroundColor Cyan
}

# Ejecutar limpieza con parámetros por defecto
Start-Cleanup @args
