# LoveRose API Documentation

## Descripción General

LoveRose es una plataforma social moderna construida con .NET 8, siguiendo los principios de Clean Architecture. Esta documentación proporciona una visión general de la API, sus endpoints y cómo interactuar con ellos.

## Características Principales

- **Autenticación JWT** con refresh tokens
- **Autorización basada en roles** (Admin, User, Moderator, ContentCreator)
- **Validación de entrada** automática
- **Manejo global de errores** con respuestas estandarizadas
- **Documentación Swagger/OpenAPI** interactiva
- **Seguridad mejorada** con CORS, rate limiting y protección contra ataques comunes

## Autenticación

### Flujo de Autenticación

1. **Login**: Obtén un token JWT con tus credenciales
2. **Uso**: Incluye el token en el header `Authorization: Bearer <token>`
3. **Renovación**: Usa el refresh token para obtener un nuevo JWT cuando expire

### Endpoints de Autenticación

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "TuContraseña123!"
}
```

**Respuesta Exitosa (200 OK)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "5b5a9f8e-1234-5678-90ab-cdef12345678",
  "expiresIn": 3600,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "usuario@ejemplo.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "roles": ["User"]
  }
}
```

#### Refresh Token

```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "5b5a9f8e-1234-5678-90ab-cdef12345678"
}
```

## Documentación de la API LoveRose

### Autenticación

#### Login

```http
POST /api/auth/login
```

**Cuerpo de la solicitud:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta exitosa (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh-token-aqui",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "firstName": "Nombre",
    "lastName": "Apellido",
    "roles": ["User"]
  }
}
```

### Usuarios

#### Obtener perfil de usuario

```http
GET /api/users/me
Authorization: Bearer {token}
```

**Respuesta exitosa (200 OK):**
```json
{
  "id": 1,
  "email": "usuario@ejemplo.com",
  "firstName": "Nombre",
  "lastName": "Apellido",
  "bio": "Descripción del perfil",
  "profileImage": "https://picsum.photos/200",
  "followersCount": 42,
  "followingCount": 12,
  "postsCount": 5,
  "createdAt": "2023-01-01T00:00:00Z"
}
```

#### Actualizar perfil

```http
PUT /api/users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Nuevo Nombre",
  "lastName": "Nuevo Apellido",
  "bio": "Nueva descripción"
}
```

### Publicaciones

#### Obtener publicaciones

```http
GET /api/posts
Authorization: Bearer {token}
```

**Parámetros de consulta:**
- `page` (opcional): Número de página (por defecto: 1)
- `pageSize` (opcional): Tamaño de página (por defecto: 10)

**Respuesta exitosa (200 OK):**
```json
{
  "items": [
    {
      "id": 1,
      "content": "Contenido de la publicación",
      "imageUrl": "https://picsum.photos/800/600",
      "likesCount": 10,
      "commentsCount": 3,
      "createdAt": "2023-01-01T12:00:00Z",
      "user": {
        "id": 1,
        "username": "usuario1",
        "profileImage": "https://picsum.photos/200"
      },
      "isLiked": false
    }
  ],
  "totalCount": 1,
  "pageNumber": 1,
  "totalPages": 1
}
```

#### Crear publicación

```http
POST /api/posts
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "content": "Nueva publicación",
  "image": [archivo]
}
```

### Comentarios

#### Agregar comentario

```http
POST /api/posts/{postId}/comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Excelente publicación!"
}
```

### Seguimiento

#### Seguir a un usuario

```http
POST /api/users/{userId}/follow
Authorization: Bearer {token}
```

#### Dejar de seguir a un usuario

```http
DELETE /api/users/{userId}/follow
Authorization: Bearer {token}
```

### Mensajes

#### Obtener conversaciones

```http
GET /api/messages/conversations
Authorization: Bearer {token}
```

#### Enviar mensaje

```http
POST /api/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipientId": 2,
  "content": "Hola, ¿cómo estás?"
}
```

### Notificaciones

#### Obtener notificaciones

```http
GET /api/notifications
Authorization: Bearer {token}
```

#### Marcar como leída

```http
PUT /api/notifications/{id}/read
Authorization: Bearer {token}
```

## Estructura de Respuestas

### Respuesta Exitosa
```json
{
  "success": true,
  "data": {},
  "message": "Operación exitosa"
}
```

### Respuesta de Error
```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    {
      "field": "email",
      "message": "El campo Email es requerido"
    }
  ],
  "type": "VALIDATION_ERROR",
  "timestamp": "2025-09-08T22:15:30Z"
}
```

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - La petición se completó exitosamente |
| 201 | Creado - Recurso creado exitosamente |
| 204 | Sin Contenido - Operación exitosa sin contenido que devolver |
| 400 | Solicitud Incorrecta - Error de validación o petición mal formada |
| 401 | No Autorizado - Se requiere autenticación |
| 403 | Prohibido - No tienes permisos para acceder al recurso |
| 404 | No Encontrado - El recurso solicitado no existe |
| 409 | Conflicto - El recurso ya existe o hay un conflicto |
| 422 | Entidad No Procesable - Error de validación de negocio |
| 429 | Demasiadas Peticiones - Límite de tasa excedido |
| 500 | Error Interno del Servidor - Error inesperado |

## Endpoints Principales

### Usuarios

#### Obtener Perfil de Usuario
```http
GET /api/users/me
Authorization: Bearer <token>
```

#### Actualizar Perfil
```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "NuevoNombre",
  "lastName": "NuevoApellido"
}
```

### Posts

#### Listar Posts
```http
GET /api/posts
Authorization: Bearer <token>
```

#### Crear Post
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Mi primer post",
  "content": "Contenido del post..."
}
```

### Comentarios

#### Agregar Comentario
```http
POST /api/posts/{postId}/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Excelente publicación!"
}
```

## Validación de Datos

La API valida automáticamente todos los datos de entrada. Los errores de validación siguen este formato:

```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    {
      "field": "email",
      "message": "El campo Email no es una dirección de correo electrónico válida"
    },
    {
      "field": "password",
      "message": "La contraseña debe tener al menos 8 caracteres"
    }
  ]
}
```

## Paginación

Los endpoints que devuelven listas soportan paginación con los siguientes parámetros de consulta:

- `page`: Número de página (por defecto: 1)
- `pageSize`: Tamaño de la página (por defecto: 10, máximo: 100)

**Ejemplo de respuesta paginada:**
```json
{
  "success": true,
  "data": {
    "items": [
      { "id": 1, "title": "Post 1" },
      { "id": 2, "title": "Post 2" }
    ],
    "totalCount": 2,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

## Manejo de Errores

La API utiliza códigos de estado HTTP estándar y respuestas JSON consistentes. Los tipos de error incluyen:

- `VALIDATION_ERROR`: Error de validación de datos
- `AUTH_ERROR`: Error de autenticación o autorización
- `NOT_FOUND`: Recurso no encontrado
- `CONFLICT`: Conflicto con el estado actual
- `RATE_LIMIT_EXCEEDED`: Límite de tasa excedido
- `INTERNAL_SERVER_ERROR`: Error interno del servidor

## Rate Limiting

La API implementa límites de tasa para prevenir abusos:

- **Autenticación**: 5 intentos por minuto por IP
- **API Pública**: 100 solicitudes por minuto por IP
- **API Autenticada**: 1000 solicitudes por minuto por usuario

## Seguridad

- **HTTPS**: Se requiere para todas las conexiones
- **CORS**: Configurado para orígenes específicos
- **Cabeceras de Seguridad**:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Content-Security-Policy: default-src 'self'

## Documentación Interactiva

Puedes explorar la API interactivamente usando la documentación Swagger en:

```
GET /swagger
```

## Soporte

Para problemas o preguntas, contacta a soporte@loverose.com o abre un issue en nuestro [repositorio de GitHub](https://github.com/tu-usuario/love-rose/issues).

---

Última actualización: Septiembre 2025  
Versión de la API: 1.0.0
