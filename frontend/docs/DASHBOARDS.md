# Estructura de Dashboards

Este documento describe la estructura y responsabilidades de los dashboards en la aplicación LoveRose.

## Dashboards Principales

### 1. UserDashboard (`UserDashboard.tsx`)
- **Rol**: Usuario estándar
- **Ruta**: `/user`
- **Descripción**: Dashboard principal para usuarios regulares que interactúan con los modelos.
- **Características principales**:
  - Feed de contenido
  - Búsqueda de modelos
  - Notificaciones
  - Mensajería
  - Perfil de usuario

### 2. ModelDashboard (`ModelDashboard.tsx`)
- **Rol**: Modelo
- **Ruta**: `/model`
- **Descripción**: Dashboard para modelos que ofrecen contenido y servicios.
- **Características principales**:
  - Gestión de contenido
  - Estadísticas de rendimiento
  - Mensajería con usuarios
  - Configuración de perfil
  - Gestión de disponibilidad

### 3. AdminDashboard (`AdminDashboard.tsx`)
- **Rol**: Administrador
- **Ruta**: `/admin`
- **Descripción**: Panel de control administrativo.
- **Características principales**:
  - Gestión de usuarios
  - Moderación de contenido
  - Reportes y estadísticas
  - Configuración del sistema

### 4. SuperAdminDashboard (`SuperAdminDashboard.tsx`)
- **Rol**: Super Administrador
- **Ruta**: `/super-admin`
- **Descripción**: Panel con acceso completo al sistema.
- **Características principales**:
  - Gestión de administradores
  - Configuraciones avanzadas
  - Auditoría del sistema
  - Respaldo y restauración

### 5. StudyDashboard (`StudyDashboard.tsx`)
- **Rol**: Estudio
- **Ruta**: `/study`
- **Descripción**: Dashboard para estudios que gestionan múltiples modelos.
- **Características principales**:
  - Gestión de modelos asociados
  - Estadísticas de rendimiento
  - Facturación y pagos
  - Herramientas de colaboración

## Estructura de Carpetas

```
frontend/
└── src/
    └── presentation/
        └── pages/
            └── dashboards/
                ├── UserDashboard.tsx
                ├── ModelDashboard.tsx
                ├── AdminDashboard.tsx
                ├── SuperAdminDashboard.tsx
                └── StudyDashboard.tsx
```

## Reglas de Desarrollo

1. **Componentes Reutilizables**: Extraer componentes compartidos en `presentation/components/`
2. **Estilos**: Usar el tema de Material-UI para mantener consistencia
3. **Tipos**: Definir interfaces de TypeScript para los props y estados
4. **Rutas**: Usar react-router-dom para la navegación
5. **Estados Globales**: Usar contextos de React para estados compartidos

## Convenciones de Nombrado

- Componentes: `PascalCase`
- Archivos: `PascalCase` para componentes, `kebab-case` para utilidades
- Variables y funciones: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`
- Interfaces: `IPascalCase` o `PascalCase`

## Próximos Pasos

1. Implementar lazy loading para los dashboards
2. Mejorar el manejo de errores
3. Añadir más documentación de componentes
4. Implementar pruebas unitarias
