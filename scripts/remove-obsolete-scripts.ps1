# Script para eliminar scripts obsoletos
# Versión: 1.0
# Descripción: Elimina scripts obsoletos y actualiza la documentación

# Configuración
$ErrorActionPreference = "Stop"
$baseDir = Split-Path -Parent $PSScriptRoot
$scriptsDir = Join-Path $baseDir "scripts"

# Scripts a eliminar (reemplazados por install-dependencies.ps1)
$obsoleteScripts = @(
    "setup-dev.ps1",
    "migrate-database.ps1"
)

# Archivos de documentación a actualizar
$docsToUpdate = @(
    "README.md",
    "TECHNICAL_SPECS.md",
    "CONTRIBUTING.md"
)

# Función para respaldar un archivo
function Backup-File {
    param($filePath)
    
    if (Test-Path $filePath) {
        $backupPath = "$filePath.bak"
        Copy-Item -Path $filePath -Destination $backupPath -Force
        return $backupPath
    }
    return $null
}

# Función para actualizar la documentación
function Update-Documentation {
    Write-Host "Actualizando documentación..." -ForegroundColor Cyan
    
    foreach ($doc in $docsToUpdate) {
        $docPath = Join-Path $baseDir $doc
        if (-not (Test-Path $docPath)) { continue }
        
        $backupFile = Backup-File -filePath $docPath
        $content = Get-Content -Path $docPath -Raw
        
        # Reemplazar referencias a scripts obsoletos
        $updatedContent = $content -replace "setup-dev\.ps1", "install-dependencies.ps1"
        $updatedContent = $updatedContent -replace "migrate-database\.ps1", "install-dependencies.ps1"
        
        # Agregar sección sobre el nuevo script de instalación si no existe
        if ($doc -eq "README.md" -and $updatedContent -notmatch "## Instalación de dependencias") {
            $installSection = @"

## Instalación de dependencias

Para instalar todas las dependencias necesarias para desarrollar en LoveRose, ejecuta:

```powershell
# Instalar dependencias del frontend y backend
.\scripts\install-dependencies.ps1

# O instalar solo frontend o backend
.\scripts\install-dependencies.ps1 -SkipBackend  # Solo frontend
.\scripts\install-dependencies.ps1 -SkipFrontend # Solo backend
```

Este script automáticamente:
- Verifica e instala Node.js si es necesario
- Verifica e instala .NET SDK si es necesario
- Instala las dependencias del frontend (npm install)
- Instala las dependencias del backend (npm install o dotnet restore)
"@
            $updatedContent = $updatedContent.TrimEnd() + "`n`n" + $installSection.Trim()
        }
        
        # Guardar cambios si hubo actualizaciones
        if ($updatedContent -ne $content) {
            $updatedContent | Set-Content -Path $docPath -NoNewline
            Write-Host "  ✓ Actualizado: $doc" -ForegroundColor Green
            if ($backupFile) {
                Write-Host "    (Copia de seguridad: $backupFile)" -ForegroundColor DarkGray
            }
        } else {
            Write-Host "  - Sin cambios: $doc" -ForegroundColor Gray
        }
    }
}

# Eliminar scripts obsoletos
Write-Host "Eliminando scripts obsoletos..." -ForegroundColor Cyan
foreach ($script in $obsoleteScripts) {
    $scriptPath = Join-Path $scriptsDir $script
    if (Test-Path $scriptPath) {
        try {
            Remove-Item -Path $scriptPath -Force
            Write-Host "  ✓ Eliminado: $script" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ Error al eliminar $script : $_" -ForegroundColor Red
        }
    } else {
        Write-Host "  - No encontrado: $script" -ForegroundColor Gray
    }
}

# Actualizar documentación
Update-Documentation

Write-Host "`n¡Proceso completado!" -ForegroundColor Green
Write-Host "Los scripts obsoletos han sido eliminados y la documentación ha sido actualizada." -ForegroundColor Cyan
Write-Host "`nPara instalar las dependencias, ejecuta: .\scripts\install-dependencies.ps1" -ForegroundColor Yellow
