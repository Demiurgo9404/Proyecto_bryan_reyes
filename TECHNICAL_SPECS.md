# LoveRose - Especificaciones Técnicas

## 1. Información General

- **Nombre del Proyecto**: LoveRose
- **Tipo**: Plataforma de Red Social con Videollamadas
- **Versión Actual**: 1.0.0
- **Última Actualización**: $(Get-Date -Format "yyyy-MM-dd")
- **Repositorio**: [GitHub Repository](https://github.com/Demiurgo9404/Proyecto_bryan_reyes)

## 2. Arquitectura del Sistema

### 2.1. Diagrama de Arquitectura

```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|   Frontend       |<--->|    Backend       |<--->|   Base de Datos  |
|   (React)        |     |    (Node.js)     |     |   (PostgreSQL)   |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
        ^                                                ^
        |                                                |
        v                                                v
+------------------+                           +------------------+
|                  |                           |                  |
|   Navegador Web  |                           |   Servicios      |
|   (Cliente)      |                           |   Externos       |
|                  |                           |                  |
+------------------+                           +------------------+
```

### 2.2. Tecnologías Principales

| Componente       | Tecnología                    | Versión  |
|------------------|-------------------------------|----------|
| Frontend         | React                         | ^18.2.0  |
| Backend          | Node.js                       | ^16.0.0  |
| Base de Datos    | PostgreSQL                    | ^14.0    |
| ORM              | Sequelize                     | ^6.0.0   |
| Autenticación    | JWT                           | ^8.5.1   |
| Estilos          | CSS Modules                   | -        |
| Construcción     | Vite                          | ^4.0.0   |
| Control de Versiones | Git                      | ^2.0.0   |

## 3. Requisitos del Sistema

### 3.1. Requisitos Mínimos

#### Servidor
- **Sistema Operativo**: Linux/Windows Server 2016+
- **CPU**: 2 núcleos
- **RAM**: 4GB
- **Almacenamiento**: 20GB SSD
- **Red**: 100Mbps

#### Cliente
- **Navegador**: Chrome 100+, Firefox 100+, Edge 100+, Safari 14+
- **Resolución Mínima**: 1280x720
- **Conexión a Internet**: 10Mbps para video SD, 25Mbps para HD

## 4. Estructura del Proyecto

### 4.1. Frontend (React)

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
    ├── hooks/              # Custom hooks
    ├── infrastructure/     # Implementaciones de infraestructura
    ├── pages/              # Componentes de página
    ├── presentation/       # Componentes de presentación
    └── utils/              # Utilidades
```

### 4.2. Backend (Node.js)

```
backend/
├── src/
    ├── application/        # Casos de uso
    │   ├── use-cases/     # Casos de uso específicos
    │   └── services/      # Servicios de aplicación
    ├── config/            # Configuraciones
    ├── domain/            # Lógica de negocio
    ├── infrastructure/    # Implementaciones concretas
    ├── interfaces/        # Controladores y rutas
    └── tests/             # Pruebas
```

## 5. Dependencias Principales

### 5.1. Frontend

| Paquete              | Versión  | Propósito                            |
|----------------------|----------|--------------------------------------|
| react                | ^18.2.0  | Biblioteca de UI                     |
| react-dom            | ^18.2.0  | Renderizado de React para navegador  |
| react-router-dom     | ^6.4.0   | Enrutamiento                         |
| axios               | ^1.1.0   | Cliente HTTP                         |
| jwt-decode          | ^3.1.2   | Decodificación de tokens JWT         |
| sass                | ^1.55.0  | Preprocesador CSS                    |
| @mui/material       | ^5.10.0  | Componentes de UI                    |
| @emotion/react      | ^11.10.0 | Estilizado de componentes            |
| @emotion/styled     | ^11.10.0 | Estilizado de componentes            |
| @testing-library/*  | ^13.4.0  | Pruebas unitarias                    |

### 5.2. Backend

| Paquete              | Versión  | Propósito                            |
|----------------------|----------|--------------------------------------|
| express             | ^4.18.2  | Framework web                         |
| pg                  | ^8.8.0   | Cliente PostgreSQL                   |
| sequelize           | ^6.21.4  | ORM para Node.js                     |
| jsonwebtoken        | ^8.5.1   | Manejo de tokens JWT                 |
| bcryptjs            | ^2.4.3   | Encriptación de contraseñas          |
| cors                | ^2.8.5   | Middleware para CORS                 |
| dotenv              | ^16.0.3  | Variables de entorno                 |
| helmet              | ^6.0.0   | Seguridad HTTP                       |
| winston             | ^3.8.2   | Logging                              |
| jest                | ^29.0.0  | Framework de pruebas                 |
| supertest           | ^6.2.4   | Pruebas HTTP                         |

## 6. Variables de Entorno

### 6.1. Requeridas

```env
# Backend
NODE_ENV=development
PORT=3001

# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=loverose_db
DB_USER=postgres
DB_PASSWORD=Roximar2025

# Autenticación
JWT_SECRET=tu_clave_secreta_muy_segura
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 6.2. Opcionales

```env
# Logging
LOG_LEVEL=debug

# Correo Electrónico
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=tu_usuario
SMTP_PASSWORD=tu_contraseña
SMTP_FROM=noreply@loverose.com
```

## 7. Guía de Instalación

### 7.1. Requisitos Previos

- Node.js 16+
- PostgreSQL 14+
- npm 8+
- Git

### 7.2. Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/Demiurgo9404/Proyecto_bryan_reyes.git
   cd Proyecto_bryan_reyes
   ```

2. Instalar dependencias del backend:
   ```bash
   cd backend
   npm install
   ```

3. Instalar dependencias del frontend:
   ```bash
   cd ../frontend
   npm install
   ```

4. Configurar variables de entorno (ver sección 6)

5. Iniciar servidores de desarrollo:
   ```bash
   # En una terminal
   cd backend
   npm run dev
   
   # En otra terminal
   cd frontend
   npm run dev
   ```

## 8. Pruebas

### 8.1. Pruebas Unitarias

```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
npm test
```

### 8.2. Pruebas de Integración

```bash
cd backend
npm run test:integration
```

## 9. Despliegue

### 9.1. Requisitos de Producción

- Servidor Linux (Ubuntu 20.04+ recomendado)
- Nginx como proxy inverso
- PM2 para gestión de procesos de Node.js
- Certificado SSL (Let's Encrypt recomendado)

### 9.2. Comandos de Despliegue

```bash
# Construir para producción
cd frontend
npm run build

# Iniciar en producción (backend)
cd ../backend
NODE_ENV=production npm start
```

## 10. Mantenimiento

### 10.1. Actualización de Dependencias

```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar dependencias
npm update
```

### 10.2. Monitoreo

- **Logs**: Revisar archivos en `/var/log/loverose/`
- **Métricas**: Usar PM2 para monitoreo de procesos
- **Rendimiento**: Usar herramientas como New Relic o Datadog

## 11. Seguridad

### 11.1. Mejores Prácticas

- No exponer credenciales en el código
- Usar HTTPS en producción
- Implementar rate limiting
- Validar todas las entradas de usuario
- Mantener dependencias actualizadas

### 11.2. Auditoría de Seguridad

```bash
# Ejecutar auditoría de seguridad
npm audit

# Corregir vulnerabilidades
npm audit fix
```

## 12. Soporte

Para reportar problemas o solicitar soporte, por favor abra un issue en el [repositorio del proyecto](https://github.com/Demiurgo9404/Proyecto_bryan_reyes/issues).

## 13. Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).
