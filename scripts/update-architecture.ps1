# Script para actualizar y limpiar la estructura del proyecto LoveRose
# Creado: $(Get-Date -Format "yyyy-MM-dd")

# Configuración
$ErrorActionPreference = "Stop"
$baseDir = Split-Path -Parent $PSScriptRoot
$backupDir = Join-Path $baseDir "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

# Función para crear directorios
function Ensure-Directory {
    param([string]$path)
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path | Out-Null
        Write-Host "Creado directorio: $path" -ForegroundColor Green
    }
}

# Función para hacer backup de archivos existentes
function Backup-File {
    param([string]$filePath)
    if (Test-Path $filePath) {
        $relativePath = $filePath.Replace($baseDir, '').TrimStart('\\')
        $backupPath = Join-Path $backupDir $relativePath
        $backupDirPath = Split-Path -Parent $backupPath
        
        if (-not (Test-Path $backupDirPath)) {
            New-Item -ItemType Directory -Path $backupDirPath -Force | Out-Null
        }
        
        Copy-Item -Path $filePath -Destination $backupPath -Force
        Write-Host "Backup creado: $backupPath" -ForegroundColor Yellow
    }
}

# Función para limpiar archivos y directorios innecesarios
function Cleanup-Project {
    Write-Host "`nIniciando limpieza del proyecto..." -ForegroundColor Cyan
    
    # Directorios y archivos a eliminar
    $itemsToRemove = @(
        # Archivos de desarrollo
        "*.log",
        "*.log.*",
        "*.tmp",
        "*.tmp.*",
        "*.bak",
        "*.swp",
        "*~",
        "*.swo",
        "*.swn",
        "*.sass-cache",
        
        # Directorios de dependencias temporales
        "node_modules/.cache",
        "node_modules/.bin",
        "node_modules/.vite",
        "node_modules/.yarn-integrity",
        
        # Directorios de build antiguos
        "dist/",
        "build/",
        "out/",
        ".next/",
        ".nuxt/",
        ".sass-cache/",
        
        # Archivos de IDE
        ".idea/",
        ".vscode/",
        "*.suo",
        "*.ntvs*",
        "*.njsproj",
        "*.sln",
        "*.sw?",
        
        # Archivos de sistema operativo
        ".DS_Store",
        "Thumbs.db",
        "desktop.ini",
        
        # Archivos de paquetes de desarrollo
        "package-lock.json",
        "yarn.lock",
        "pnpm-lock.yaml"
    )
    
    # Directorios que pueden contener archivos temporales
    $tempDirs = @(
        "**/__pycache__/",
        "**/.pytest_cache/",
        "**/.mypy_cache/",
        "**/.coverage",
        "**/.mypy_cache",
        "**/.pytest_cache",
        "**/.cache",
        "**/.parcel-cache",
        "**/.eslintcache",
        "**/.vscode-test/",
        "**/.vscode-test-web/"
    )

    # Eliminar archivos temporales
    foreach ($pattern in $itemsToRemove) {
        Get-ChildItem -Path $baseDir -Recurse -Force -Include $pattern -ErrorAction SilentlyContinue | ForEach-Object {
            try {
                if ($_.PSIsContainer) {
                    Remove-Item -Path $_.FullName -Recurse -Force -ErrorAction Stop
                    Write-Host "Eliminado directorio: $($_.FullName)" -ForegroundColor Red
                } else {
                    Remove-Item -Path $_.FullName -Force -ErrorAction Stop
                    Write-Host "Eliminado archivo: $($_.FullName)" -ForegroundColor Red
                }
            } catch {
                Write-Host "Error al eliminar $($_.FullName): $_" -ForegroundColor Yellow
            }
        }
    }
    
    # Eliminar directorios temporales
    foreach ($dir in $tempDirs) {
        Get-ChildItem -Path $baseDir -Directory -Recurse -Force -Include $dir -ErrorAction SilentlyContinue | ForEach-Object {
            try {
                Remove-Item -Path $_.FullName -Recurse -Force -ErrorAction Stop
                Write-Host "Eliminado directorio temporal: $($_.FullName)" -ForegroundColor Red
            } catch {
                Write-Host "Error al eliminar directorio temporal $($_.FullName): $_" -ForegroundColor Yellow
            }
        }
    }
    
    # Limpiar node_modules y reinstalar dependencias
    $nodeModulesDirs = @("frontend", "backend") | ForEach-Object { Join-Path $baseDir $_ } | Where-Object { Test-Path (Join-Path $_ "node_modules") }
    
    foreach ($dir in $nodeModulesDirs) {
        $nodeModulesPath = Join-Path $dir "node_modules"
        if (Test-Path $nodeModulesPath) {
            try {
                Write-Host "Eliminando node_modules en $dir..." -ForegroundColor Yellow
                Remove-Item -Path $nodeModulesPath -Recurse -Force -ErrorAction Stop
                Write-Host "node_modules eliminado en $dir" -ForegroundColor Green
                
                # Reinstalar dependencias
                Write-Host "Reinstalando dependencias en $dir..." -ForegroundColor Cyan
                Set-Location $dir
                npm install --silent
                Write-Host "Dependencias reinstaladas en $dir" -ForegroundColor Green
            } catch {
                Write-Host "Error al limpiar node_modules en $dir : $_" -ForegroundColor Red
            }
        }
    }
    
    # Limpiar archivos de caché de npm
    $npmCache = Join-Path $env:USERPROFILE "AppData\Roaming\npm-cache"
    if (Test-Path $npmCache) {
        try {
            Remove-Item -Path "$npmCache\_cacache" -Recurse -Force -ErrorAction Stop
            Write-Host "Caché de npm limpiada" -ForegroundColor Green
        } catch {
            Write-Host "Error al limpiar caché de npm: $_" -ForegroundColor Yellow
        }
    }
    
    Write-Host "Limpieza completada" -ForegroundColor Green
}

# Crear directorio de backup
Write-Host "Creando backup en: $backupDir" -ForegroundColor Cyan
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# 1. Ejecutar limpieza inicial
Cleanup-Project

# 2. Actualizar estructura del frontend
$frontendDirs = @(
    "frontend/src/application/dtos",
    "frontend/src/application/interfaces",
    "frontend/src/application/services",
    "frontend/src/application/useCases",
    "frontend/src/domain/entities",
    "frontend/src/domain/interfaces",
    "frontend/src/domain/repositories",
    "frontend/src/domain/services",
    "frontend/src/domain/valueObjects",
    "frontend/src/infrastructure/api",
    "frontend/src/infrastructure/repositories",
    "frontend/src/infrastructure/services",
    "frontend/src/presentation/components/common",
    "frontend/src/presentation/layouts",
    "frontend/src/presentation/pages",
    "frontend/src/hooks",
    "frontend/src/contexts",
    "frontend/src/config",
    "frontend/src/utils"
)

# Crear directorios faltantes
Write-Host "Creando estructura de directorios..." -ForegroundColor Cyan
$frontendDirs | ForEach-Object {
    $fullPath = Join-Path $baseDir $_
    Ensure-Directory -path $fullPath
}

# 3. Actualizar estructura del backend
$backendDirs = @(
    "backend/src/application/use-cases",
    "backend/src/application/services",
    "backend/src/domain/entities",
    "backend/src/domain/repositories",
    "backend/src/domain/value-objects",
    "backend/src/domain/exceptions",
    "backend/src/domain/events",
    "backend/src/infrastructure/persistence/entities",
    "backend/src/infrastructure/persistence/migrations",
    "backend/src/infrastructure/persistence/repositories",
    "backend/src/infrastructure/auth",
    "backend/src/infrastructure/external-services",
    "backend/src/infrastructure/messaging",
    "backend/src/interfaces/http/controllers",
    "backend/src/interfaces/http/middlewares",
    "backend/src/interfaces/http/routes",
    "backend/src/interfaces/websockets",
    "backend/src/config",
    "backend/tests/unit",
    "backend/tests/integration"
)

# Crear directorios faltantes
Write-Host "Creando estructura de directorios..." -ForegroundColor Cyan
$backendDirs | ForEach-Object {
    $fullPath = Join-Path $baseDir $_
    Ensure-Directory -path $fullPath
}

# 4. Crear archivos base de configuración
$configFiles = @{
    "frontend/src/config/api.config.ts" = @"
// Configuración de la API
export const API_CONFIG = {
  baseUrl: process.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  debug: process.env.VITE_DEBUG_HTTP === 'true',
  logLevel: process.env.VITE_LOG_LEVEL || 'error'
};
"@

    "backend/src/config/app.config.ts" = @"
// Configuración de la aplicación
export const APP_CONFIG = {
  port: parseInt(process.env.PORT || '3001'),
  environment: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
};
"@

    "backend/src/config/database.config.ts" = @"
// Configuración de la base de datos
export const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Roximar2025',
  database: process.env.DB_NAME || 'loverose_db',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
"@
}

# Crear archivos de configuración
Write-Host "Creando archivos de configuración..." -ForegroundColor Cyan
$configFiles.GetEnumerator() | ForEach-Object {
    $filePath = Join-Path $baseDir $_.Key
    $dirPath = Split-Path -Parent $filePath
    
    Ensure-Directory -path $dirPath
    Backup-File -filePath $filePath
    
    $_.Value | Out-File -FilePath $filePath -Encoding utf8 -Force
    Write-Host "Archivo creado/actualizado: $filePath" -ForegroundColor Green
}

# 5. Crear archivo .env de ejemplo
$envExample = @"
# Configuración de la aplicación
NODE_ENV=development
PORT=3001

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=loverose_db
DB_USER=postgres
DB_PASSWORD=Roximar2025

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug

# Configuración de correo (opcional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=tu_usuario
SMTP_PASSWORD=tu_contraseña
SMTP_FROM=noreply@loverose.com
"@

$envPath = Join-Path $baseDir ".env"
if (-not (Test-Path $envPath)) {
    $envExample | Out-File -FilePath $envPath -Encoding utf8
    Write-Host "Archivo .env de ejemplo creado en: $envPath" -ForegroundColor Green
}

# 6. Crear archivo README con instrucciones
$readmePath = Join-Path $baseDir "README-ARCHITECTURE.md"
$readmeContent = @"
# Estructura de la Aplicación LoveRose

## Arquitectura

### Frontend (React + TypeScript)

```
frontend/
├── public/                 # Assets estáticos
└── src/
    ├── api/               # Clientes y configuraciones de API
    ├── application/        # Lógica de aplicación
    │   ├── dtos/          # Objetos de transferencia de datos
    │   ├── interfaces/     # Interfaces de servicios
    │   ├── services/      # Implementación de servicios
    │   └── useCases/      # Casos de uso de la aplicación
    ├── components/         # Componentes de UI reutilizables
    ├── config/             # Configuraciones
    ├── contexts/           # Contextos de React
    ├── domain/             # Lógica de dominio
    │   ├── entities/       # Entidades de dominio
    │   ├── interfaces/     # Interfaces de dominio
    │   ├── repositories/   # Interfaces de repositorios
    │   ├── services/       # Servicios de dominio
    │   └── valueObjects/   # Objetos de valor
    ├── hooks/              # Custom hooks
    ├── infrastructure/     # Implementaciones de infraestructura
    │   ├── api/           # Clientes HTTP
    │   ├── repositories/   # Implementación de repositorios
    │   └── services/      # Servicios externos
    ├── pages/              # Componentes de página
    ├── presentation/       # Componentes de presentación
    └── utils/              # Utilidades
```

### Backend (Node.js + Express + Sequelize)

```
backend/
├── src/
    ├── application/        # Casos de uso
    │   ├── use-cases/     # Casos de uso específicos
    │   └── services/      # Servicios de aplicación
    ├── config/            # Configuraciones
    ├── domain/            # Lógica de negocio
    │   ├── entities/      # Entidades de dominio
    │   ├── repositories/  # Interfaces de repositorios
    │   ├── value-objects/ # Objetos de valor
    │   └── exceptions/    # Excepciones de dominio
    ├── infrastructure/    # Implementaciones concretas
    │   ├── persistence/   # ORM y bases de datos
    │   ├── auth/         # Autenticación y autorización
    │   └── external-services/ # Servicios externos
    ├── interfaces/        # Controladores y rutas
    │   ├── http/         # API REST
    │   └── websockets/   # WebSockets
    └── tests/             # Pruebas
        ├── unit/         # Pruebas unitarias
        └── integration/  # Pruebas de integración
```

## Configuración Inicial

1. Copiar el archivo `.env.example` a `.env` y configurar las variables necesarias
2. Instalar dependencias:
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```

3. Iniciar la aplicación:
   ```bash
   # Frontend
   cd frontend
   npm run dev
   
   # Backend (en otra terminal)
   cd backend
   npm run dev
   ```

## Convenciones de Código

- **Nombres de archivos**: Usar kebab-case para archivos y carpetas
- **Componentes**: Usar PascalCase para nombres de componentes
- **Hooks**: Prefijo 'use' (ej: useAuth, useForm)
- **Tipos/Interfaces**: Prefijo 'I' (ej: IUser, IRepository)
- **Constantes**: UPPER_SNAKE_CASE

## Pruebas

Ejecutar pruebas:

```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
npm test
```

## Despliegue

Ver la documentación de despliegue en `DEPLOYMENT.md`
"@

Backup-File -filePath $readmePath
$readmeContent | Out-File -FilePath $readmePath -Encoding utf8
Write-Host "Archivo README-ARCHITECTURE.md creado/actualizado" -ForegroundColor Green

# 7. Actualizar package.json del backend
$backendPackageJson = @"
{
  "name": "loverose-backend",
  "version": "1.0.0",
  "description": "Backend API para LoveRose",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "migrate": "ts-node node_modules/typeorm/cli migration:run -d src/config/data-source.ts",
    "migrate:revert": "ts-node node_modules/typeorm/cli migration:revert -d src/config/data-source.ts",
    "migrate:generate": "ts-node node_modules/typeorm/cli migration:generate -d src/config/data-source.ts",
    "typeorm": "ts-node ./node_modules/typeorm/cli.js"
  },
  "dependencies": {
    "@types/bcryptjs": "^2.4.2",
    "@types/cors": "^2.8.12",
    "@types/express": "^4.17.13",
    "@types/jsonwebtoken": "^8.5.8",
    "@types/node": "^16.11.7",
    "@types/uuid": "^8.3.4",
    "@types/validator": "^13.7.0",
    "@types/ws": "^8.5.3",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^10.0.0",
    "express": "^4.17.1",
    "express-async-errors": "^3.1.1",
    "express-validator": "^6.13.0",
    "helmet": "^4.6.0",
    "http-status-codes": "^2.2.0",
    "jsonwebtoken": "^8.5.1",
    "morgan": "^1.10.0",
    "pg": "^8.7.1",
    "reflect-metadata": "^0.1.13",
    "routing-controllers": "^0.10.3",
    "typeorm": "^0.2.41",
    "typescript": "^4.5.2",
    "uuid": "^8.3.2",
    "winston": "^3.3.3",
    "ws": "^8.3.0"
  },
  "devDependencies": {
    "@types/jest": "^27.0.3",
    "@types/morgan": "^1.9.3",
    "@types/supertest": "^2.0.11",
    "@typescript-eslint/eslint-plugin": "^5.5.0",
    "@typescript-eslint/parser": "^5.5.0",
    "eslint": "^8.4.0",
    "eslint-config-prettier": "^8.3.0",
    "eslint-plugin-prettier": "^4.0.0",
    "jest": "^27.4.5",
    "prettier": "^2.5.0",
    "supertest": "^6.1.6",
    "ts-jest": "^27.1.2",
    "ts-node": "^10.4.0",
    "ts-node-dev": "^1.1.8",
    "tsconfig-paths": "^3.12.0"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
"@

$backendPackageJsonPath = Join-Path $baseDir "backend/package.json"
Backup-File -filePath $backendPackageJsonPath
$backendPackageJson | Out-File -FilePath $backendPackageJsonPath -Encoding utf8
Write-Host "Archivo package.json del backend actualizado" -ForegroundColor Green

# 8. Crear archivo .gitignore si no existe
$gitignorePath = Join-Path $baseDir ".gitignore"
if (-not (Test-Path $gitignorePath)) {
    $gitignoreContent = @"
# Dependencias
node_modules/

# Entorno
.env
.env.*
!.env.example

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directorios de build
dist/
build/

# Archivos de IDE
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Archivos de sistema operativo
.DS_Store
Thumbs.db
"@
    $gitignoreContent | Out-File -FilePath $gitignorePath -Encoding utf8
    Write-Host "Archivo .gitignore creado" -ForegroundColor Green
}

# 9. Limpieza final
Write-Host "`nRealizando limpieza final..." -ForegroundColor Cyan
Cleanup-Project

Write-Host "`n¡Proceso completado con éxito!" -ForegroundColor Green
Write-Host "Backup disponible en: $backupDir" -ForegroundColor Yellow
Write-Host "`nSiguientes pasos:" -ForegroundColor Cyan
Write-Host "1. Revisa los cambios realizados" -ForegroundColor White
Write-Host "2. Ejecuta 'npm install' en los directorios frontend y backend" -ForegroundColor White
Write-Host "3. Configura las variables de entorno en el archivo .env" -ForegroundColor White
Write-Host "4. Inicia los servidores de desarrollo con 'npm run dev'" -ForegroundColor White
