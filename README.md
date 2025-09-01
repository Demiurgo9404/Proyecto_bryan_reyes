# LoveRose - Plataforma Social con Videollamadas

Una plataforma social completa con funcionalidades de descubrimiento de modelos, videollamadas en tiempo real y sistema de propinas.

## 🚀 Inicio Rápido

### Prerrequisitos
- **Node.js** (v16 o superior) - [Descargar aquí](https://nodejs.org/)
- **PostgreSQL** (v12 o superior) - [Descargar aquí](https://www.postgresql.org/download/)
- **Git** - [Descargar aquí](https://git-scm.com/)

### 📁 Estructura del Proyecto
```
love_rose/
├── backend/           # Servidor API Express.js
├── frontend/          # Aplicación React + TypeScript
├── scripts/           # Scripts de base de datos y configuración
├── config/            # Configuración de base de datos
└── docs/              # Documentación
```

## 🗄️ Configuración de Base de Datos

### 1. Crear Base de Datos
```bash
# Conectar a PostgreSQL como superusuario
psql -U postgres

# Crear la base de datos
CREATE DATABASE Love_rose_db;
\q
```

### 2. Configurar y Ejecutar Migraciones
```bash
# Desde el directorio raíz del proyecto
cd c:\Users\Demiurgo\Documents\GitHub\love_rose

# Ejecutar script de configuración automática
node scripts/setup-database.js

# O manualmente:
psql -h localhost -U postgres -d Love_rose_db -f scripts/create-database-schema.sql
```

## 🔧 Backend (Servidor API)

### Instalación y Configuración
```bash
# 1. Navegar al directorio del proyecto
cd c:\Users\Demiurgo\Documents\GitHub\love_rose

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
copy .env.example .env
# Editar .env con tus credenciales de base de datos

# 4. Verificar conexión a base de datos
npm run check-db

# 5. Iniciar servidor backend
npm start
```

### Inicio Automático (Windows)
```bash
# Ejecutar script automático que hace todo lo anterior
scripts\start-backend.bat
```

### URLs del Backend
- **Servidor**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health
- **API Base**: http://localhost:3001/api

## 🎨 Frontend (Aplicación React)

### Instalación y Configuración
```bash
# 1. Navegar al directorio frontend
cd c:\Users\Demiurgo\Documents\GitHub\love_rose\frontend

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

### URLs del Frontend
- **Aplicación**: http://localhost:5173
- **Modo Desarrollo**: http://localhost:3000 (si usas `npm start`)

## 🔄 Iniciar Ambos Servicios

### Opción 1: Terminales Separadas
```bash
# Terminal 1 - Backend
cd c:\Users\Demiurgo\Documents\GitHub\love_rose
npm start

# Terminal 2 - Frontend  
cd c:\Users\Demiurgo\Documents\GitHub\love_rose\frontend
npm run dev
```

### Opción 2: Script Automático (Recomendado)
```bash
# Backend automático
scripts\start-backend.bat

# En otra terminal - Frontend
cd frontend
npm run dev
```

## 📋 Scripts Disponibles

### Backend
```bash
npm start              # Iniciar servidor producción
npm run dev            # Iniciar con nodemon (desarrollo)
npm run setup-db       # Configurar base de datos
npm run check-db       # Verificar conexión DB
```

### Frontend
```bash
npm run dev            # Servidor desarrollo (Vite)
npm run build          # Build para producción
npm run preview        # Preview del build
npm run lint           # Linter TypeScript
```

## 🔐 Usuarios de Prueba

Después de ejecutar `setup-database.js`, tendrás estos usuarios:

| Email | Contraseña | Rol | Descripción |
|-------|------------|-----|-------------|
| admin@loverose.com | admin123 | SuperAdmin | Administrador principal |
| model1@loverose.com | model123 | Model | Modelo de prueba |
| user1@loverose.com | user123 | User | Usuario regular |

## 🌐 Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión

### Descubrimiento de Modelos
- `GET /api/models/active` - Modelos activos
- `GET /api/users/preferences/models` - Preferencias usuario
- `POST /api/users/swipe` - Registrar swipe

### Videollamadas
- `POST /api/video-calls/start` - Iniciar llamada
- `GET /api/video-calls/:id` - Info de llamada
- `POST /api/tips/send` - Enviar propinas

## 🛠️ Tecnologías

### Backend
- **Express.js** - Framework web
- **Sequelize** - ORM para PostgreSQL
- **bcrypt** - Encriptación de contraseñas
- **CORS** - Cross-origin requests

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Tipado estático
- **Material UI** - Componentes UI
- **Vite** - Build tool y dev server

### Base de Datos
- **PostgreSQL** - Base de datos principal
- **pgcrypto** - Extensión para encriptación

## 🔧 Solución de Problemas

### Error de Conexión a Base de Datos
```bash
# Verificar que PostgreSQL esté ejecutándose
services.msc  # Buscar PostgreSQL

# Verificar credenciales en .env
# Probar conexión manual
npm run check-db
```

### Puerto Ocupado
```bash
# Backend (puerto 3001)
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Frontend (puerto 5173)
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Dependencias
```bash
# Limpiar cache npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## 📞 Soporte

Para problemas o preguntas:
1. Verificar logs en consola
2. Revisar archivo `.env`
3. Comprobar estado de PostgreSQL
4. Verificar puertos disponibles

---

**¡LoveRose está listo para usar! 🌹**
