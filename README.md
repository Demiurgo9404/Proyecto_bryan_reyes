# LoveRose - Plataforma Social

Bienvenido a LoveRose, una plataforma social moderna construida con .NET 8, React y PostgreSQL.

## Características Principales

- Autenticación segura con JWT
- Gestión de usuarios y perfiles
- Publicaciones y comentarios
- Sistema de seguimiento entre usuarios
- Mensajería en tiempo real
- Historias y notificaciones
- Llamadas de video
- Y mucho más...

## Requisitos Previos

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL 14+](https://www.postgresql.org/download/)
- [Git](https://git-scm.com/)

## Configuración Inicial

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/love_rose.git
   cd love_rose
   ```

2. Configura la base de datos:
   - Crea una base de datos PostgreSQL llamada `love_rose`
   - Actualiza la cadena de conexión en `appsettings.Development.json`

3. Aplica las migraciones:
   ```bash
   cd src/LoveRose.API
   dotnet ef database update --project ../LoveRose.Infrastructure
   ```

4. Inicia la API:
   ```bash
   dotnet run
   ```

5. Inicia el frontend:
   ```bash
   cd ../LoveRose.Web
   npm install
   npm start
   ```

## Autenticación

La API utiliza JWT para autenticación. Incluye:
- Login/Registro
- Renovación de tokens
- Recuperación de contraseña
- Verificación de email

## Controladores

Los controladores son la capa de presentación de la API. Se encargan de manejar las solicitudes HTTP y devolver respuestas. Algunos ejemplos de controladores incluyen:
- `UsersController`: Maneja la autenticación y la gestión de usuarios.
- `PostsController`: Maneja la creación, edición y eliminación de publicaciones.
- `CommentsController`: Maneja la creación, edición y eliminación de comentarios.

## Seguridad

La seguridad es un aspecto fundamental de la plataforma. Se implementan las siguientes medidas de seguridad:
- Autenticación JWT: Se utiliza para autenticar a los usuarios y proteger las rutas de la API.
- Validación de datos: Se validan los datos de entrada para prevenir ataques de inyección de código.
- Protección contra ataques de cross-site scripting (XSS): Se implementan medidas para prevenir ataques de XSS.

## Documentación de la API

La documentación de la API está disponible en `/swagger` cuando la aplicación está en ejecución.

## Estructura del Proyecto

- `src/LoveRose.API` - API principal (ASP.NET Core)
- `src/LoveRose.Core` - Lógica de negocio y entidades
- `src/LoveRose.Infrastructure` - Acceso a datos y servicios externos
- `src/LoveRose.Web` - Aplicación web (React)
- `tests` - Pruebas unitarias y de integración

## Contribución

1. Haz un fork del proyecto
2. Crea una rama para tu característica (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.
