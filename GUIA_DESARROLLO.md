# Guía de Desarrollo - LoveRose

Aplicación de citas con videollamadas y contenido exclusivo.

## Índice
1. [Estructura del Proyecto](#estructura-del-proyecto)
2. [Configuración Inicial](#configuración-inicial)
3. [Base de Datos](#base-de-datos)
4. [Frontend](#frontend)
5. [Autenticación y Autorización](#autenticación-y-autorización)
6. [Variables de Entorno](#variables-de-entorno)
7. [Comandos Útiles](#comandos-útiles)

## Estructura del Proyecto

```
/love-rose
├── /client                     # Frontend (React/TypeScript)
│   ├── /public                # Archivos estáticos
│   ├── /src
│   │   ├── /components        # Componentes reutilizables
│   │   │   ├── /ui           # Componentes de UI personalizados
│   │   │   └── /features     # Componentes por funcionalidad
│   │   ├── /lib              # Utilidades y configuraciones
│   │   ├── /pages            # Componentes de página
│   │   ├── /store            # Gestión de estado (Redux)
│   │   │   ├── /slices       # Slices de Redux
│   │   │   └── hooks.ts      # Hooks personalizados
│   │   ├── /types            # Definiciones de tipos TypeScript
│   │   ├── App.tsx           # Componente principal
│   │   └── main.tsx          # Punto de entrada
│   ├── tsconfig.json         # Configuración de TypeScript
│   └── package.json
│
├── /server                     # Backend (Node.js/Express)
│   ├── /config                # Configuraciones
│   │   ├── config.json        # Configuración de entornos
│   │   └── database.js        # Configuración de PostgreSQL
│   ├── /controllers           # Controladores
│   │   ├── authController.js  # Autenticación
│   │   └── userController.js  # Usuarios
│   ├── /middlewares           # Middlewares
│   │   ├── auth.js            # Autenticación JWT
│   │   └── error.js           # Manejo de errores
│   ├── /models                # Modelos de Sequelize
│   │   ├── index.js           # Inicialización de modelos
│   │   ├── User.model.js      # Modelo de Usuario
│   │   └── Content.model.js   # Modelo de Contenido
│   ├── /migrations           # Migraciones de base de datos
│   ├── /scripts              # Scripts de utilidad
│   │   └── init-db.js        # Inicialización de la base de datos
│   ├── /routes               # Rutas de la API
│   │   ├── index.js          # Rutas principales
│   │   └── auth.js           # Rutas de autenticación
│   ├── app.js                # Configuración de Express
│   └── server.js             # Punto de entrada
├── .env.example              # Variables de entorno de ejemplo
├── .gitignore
└── package.json
```

## Configuración Inicial

### Requisitos Previos
- Node.js 18+
- PostgreSQL 14+
- NPM 9+

### 1. Clonar el repositorio
```bash
git clone <repositorio>
cd proyecto-v2
```

### 2. Configuración del Backend
```bash
# Instalar dependencias del servidor
cd server
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
```

### 3. Configuración del Frontend
```bash
# Instalar dependencias del cliente
cd ../client
npm install

# Configurar variables de entorno
cp .env.example .env
```

### 4. Inicializar la Base de Datos
1. Crear la base de datos en PostgreSQL:
   ```sql
   CREATE DATABASE loverose_db;
   CREATE USER loverose_user WITH PASSWORD 'tu_contraseña_segura';
   GRANT ALL PRIVILEGES ON DATABASE loverose_db TO loverose_user;
   ```

2. Ejecutar migraciones:
   ```bash
   cd server
   npx sequelize-cli db:migrate
   ```

## Base de Datos

### Estructura de la Base de Datos
El proyecto utiliza PostgreSQL con Sequelize ORM. Los modelos principales son:

#### User (Usuario)
- `id`: Identificador único
- `name`: Nombre del usuario
- `email`: Correo electrónico (único)
- `password`: Contraseña hasheada
- `role`: Rol del usuario (user/admin)
- `profileComplete`: Indica si el perfil está completo

#### Content (Contenido)
- `id`: Identificador único
- `title`: Título del contenido
- `description`: Descripción
- `mediaUrl`: URL del archivo multimedia
- `isPremium`: Indica si es contenido premium

### Migraciones
Las migraciones se gestionan con Sequelize CLI:

```bash
# Crear nueva migración
npx sequelize-cli migration:generate --name nombre-de-la-migracion

# Ejecutar migraciones
npx sequelize-cli db:migrate

# Revertir migración
npx sequelize-cli db:migrate:undo
```

## Frontend

### Estructura del Proyecto
- `/src/components`: Componentes reutilizables
  - `/ui`: Componentes de interfaz de usuario (Button, Input, etc.)
  - `/features`: Componentes por funcionalidad (auth, profile, etc.)
- `/src/pages`: Componentes de página
- `/src/lib`: Utilidades y configuraciones
- `/src/store`: Gestión de estado con Redux Toolkit
- `/src/types`: Definiciones de tipos TypeScript

### Tecnologías Principales
- React 18 con TypeScript
- Redux Toolkit para gestión de estado
- React Router para navegación
- Tailwind CSS para estilos
- Axios para peticiones HTTP
- React Hook Form para formularios
- Sonner para notificaciones toast

## Autenticación y Autorización

### Flujo de Autenticación
1. **Registro**:
   - Validación de datos con Yup
   - Hash de contraseña con bcrypt
   - Creación de token JWT

2. **Inicio de Sesión**:
   - Validación de credenciales
   - Generación de token JWT
   - Almacenamiento seguro en cookies HTTP-only

3. **Protección de Rutas**:
   - Middleware de autenticación JWT
   - Verificación de roles (user/admin)
   - Renovación de token

### Variables de Entorno

#### Backend (.env)
```env
# Servidor
NODE_ENV=development
PORT=5000

# PostgreSQL
DB_NAME=loverose_db
DB_USER=loverose_user
DB_PASSWORD=tu_contraseña_segura
DB_HOST=localhost
DB_PORT=5432

# JWT
JWT_SECRET=tu_jwt_secreto
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# CORS
FRONTEND_URL=http://localhost:5173

# Archivos
UPLOAD_PATH=./uploads
MAX_FILE_UPLOAD=10485760 # 10MB
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=tu_google_client_id
VITE_STRIPE_PUBLIC_KEY=tu_stripe_public_key
```

## Comandos Útiles

### Backend
```bash
# Iniciar servidor en desarrollo
npm run dev

# Ejecutar migraciones
npx sequelize-cli db:migrate

# Revertir migración
npx sequelize-cli db:migrate:undo

# Crear migración
npx sequelize-cli migration:generate --name nombre-migracion

# Inicializar base de datos
npm run db:init
```

### Frontend
```bash
# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar pruebas
npm test
```

## Despliegue

### Requisitos para Producción
- Servidor con Node.js 18+
- PostgreSQL 14+
- Nginx (recomendado como proxy inverso)
- Certificado SSL (Let's Encrypt recomendado)

### Variables de Entorno de Producción
Asegúrate de configurar adecuadamente las siguientes variables en producción:
- `NODE_ENV=production`
- `JWT_SECRET` seguro y único
- Configuración de base de datos de producción
- URLs correctas para CORS
- Límites de tamaño de archivo apropiados

### 2. Configuración de Docker Compose

#### docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build: .
    container_name: tinder-clone-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    volumes:
      - ./:/app
      - /app/node_modules
      - ./uploads:/app/uploads
    environment:
      - NODE_ENV=development
      - PORT=5000
      - MONGO_URI=mongodb://mongodb:27017/tinder-clone
      - JWT_SECRET=tu_jwt_secreto
      - STRIPE_SECRET_KEY=tu_clave_secreta_de_stripe
    depends_on:
      - mongodb
      - redis
    networks:
      - app-network

  mongodb:
    image: mongo:5.0
    container_name: tinder-clone-mongodb
    restart: always
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=tinder-clone
    ports:
      - "27017:27017"
    networks:
      - app-network

  redis:
    image: redis:alpine
    container_name: tinder-clone-redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - app-network

  # Agregar más servicios según sea necesario (ej: servidor de chat, colas, etc.)

networks:
  app-network:
    driver: bridge

volumes:
  mongodb_data:
  redis_data:
```

### 3. Dockerfile para el Backend

#### Dockerfile
```dockerfile
# Etapa de construcción
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Etapa de producción
FROM node:16-alpine
WORKDIR /app

# Instalar dependencias de producción
COPY package*.json ./
RUN npm install --only=production

# Copiar archivos de construcción
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Puerto de la aplicación
EXPOSE 5000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
```

### 4. Scripts de package.json

```json
{
  "name": "tinder-clone-backend",
  "version": "1.0.0",
  "description": "Backend para aplicación tipo Tinder con videollamadas",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "docker:build": "docker-compose build",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    "docker:restart": "docker-compose restart",
    "docker:bash": "docker-compose exec backend sh",
    "db:seed": "node ./seeds/seed.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "express-fileupload": "^1.4.0",
    "express-mongo-sanitize": "^2.2.0",
    "express-rate-limit": "^6.7.0",
    "helmet": "^6.0.1",
    "hpp": "^0.2.3",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^6.8.0",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "stripe": "^11.5.0",
    "uuid": "^9.0.0",
    "xss-clean": "^0.1.1"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}
```

## Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener perfil del usuario actual
- `POST /api/auth/forgot-password` - Solicitar restablecimiento de contraseña
- `PUT /api/auth/reset-password/:token` - Restablecer contraseña
- `POST /api/auth/logout` - Cerrar sesión

### Usuarios
- `GET /api/users` - Listar usuarios (solo admin)
- `GET /api/users/me` - Obtener perfil del usuario actual
- `PUT /api/users/me` - Actualizar perfil del usuario actual
- `GET /api/users/:id` - Obtener perfil de usuario (público)
- `POST /api/users/upload-avatar` - Subir avatar
- `DELETE /api/users/delete-avatar` - Eliminar avatar

### Perfiles
- `GET /api/profiles` - Listar perfiles públicos
- `GET /api/profiles/me` - Obtener perfil propio
- `PUT /api/profiles/me` - Actualizar perfil propio
- `POST /api/profiles/me/photo` - Subir foto de perfil
- `POST /api/profiles/me/cover` - Subir foto de portada
- `GET /api/profiles/search` - Buscar perfiles
- `POST /api/profiles/:id/follow` - Seguir a un perfil
- `POST /api/profiles/:id/unfollow` - Dejar de seguir a un perfil

### Sesiones de Video
- `GET /api/sessions` - Listar sesiones disponibles
- `GET /api/sessions/upcoming` - Próximas sesiones
- `GET /api/sessions/live` - Sesiones en vivo
- `GET /api/sessions/featured` - Sesiones destacadas
- `GET /api/sessions/category/:category` - Sesiones por categoría
- `GET /api/sessions/:id` - Obtener detalles de sesión
- `POST /api/sessions` - Crear nueva sesión (solo modelos)
- `PUT /api/sessions/:id` - Actualizar sesión (solo creador)
- `POST /api/sessions/:id/start` - Iniciar sesión (solo creador)
- `POST /api/sessions/:id/end` - Finalizar sesión (solo creador)
- `POST /api/sessions/:id/join` - Unirse a sesión
- `POST /api/sessions/:id/leave` - Abandonar sesión
- `GET /api/sessions/:id/participants` - Ver participantes

### Contenido
- `GET /api/contents` - Listar contenido público
- `GET /api/contents/featured` - Contenido destacado
- `GET /api/contents/trending` - Contenido en tendencia
- `GET /api/contents/latest` - Último contenido
- `GET /api/contents/category/:category` - Contenido por categoría
- `GET /api/contents/user/:userId` - Contenido de un usuario
- `GET /api/contents/:id` - Ver detalle de contenido
- `POST /api/contents` - Subir nuevo contenido
- `PUT /api/contents/:id` - Actualizar contenido
- `DELETE /api/contents/:id` - Eliminar contenido
- `POST /api/contents/:id/like` - Dar like a contenido
- `POST /api/contents/:id/comment` - Comentar en contenido
- `DELETE /api/contents/:id/comment/:commentId` - Eliminar comentario
- `POST /api/contents/:id/report` - Reportar contenido

### Transacciones
- `GET /api/transactions` - Ver historial de transacciones
- `GET /api/transactions/:id` - Ver detalle de transacción
- `POST /api/transactions` - Crear nueva transacción
- `POST /api/transactions/pay-with-wallet` - Pagar con billetera
- `POST /api/transactions/create-payment-intent` - Crear intención de pago (Stripe)
- `POST /api/transactions/create-paypal-order` - Crear orden de PayPal
- `GET /api/transactions/wallet/balance` - Ver saldo de billetera
- `POST /api/transactions/wallet/add-funds` - Agregar fondos a la billetera
- `POST /api/transactions/wallet/withdraw` - Retirar fondos

### Administración (solo admin)
- `GET /api/admin/transactions` - Ver todas las transacciones
- `GET /api/admin/stats` - Ver estadísticas
- `PUT /api/admin/transactions/:id/status` - Actualizar estado de transacción
- `POST /api/admin/transactions/:id/process-refund` - Procesar reembolso

## Autenticación y Autorización

### Flujo de autenticación JWT
1. El usuario inicia sesión con email/contraseña
2. El servidor verifica las credenciales
3. Si son válidas, genera un JWT
4. El cliente almacena el token y lo envía en el header `Authorization: Bearer <token>`

### Middleware de autenticación
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Obtener token del header
      token = req.headers.authorization.split(' ')[1];
      
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Obtener usuario del token
      req.user = await User.findById(decoded.id).select('-password');
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'No autorizado' });
    }
  }
  
  if (!token) {
    res.status(401).json({ message: 'No autorizado, no se proporcionó token' });
  }
};

module.exports = { protect };
```

## WebRTC y Videollamadas

### Arquitectura
La aplicación utiliza WebRTC para las videollamadas en tiempo real con las siguientes características:
- Conexiones P2P (peer-to-peer) para transmisión directa
- Servidor de señalización basado en Socket.IO
- Límite de tiempo configurable por sesión (15 segundos por defecto)
- Soporte para múltiples participantes en sesiones grupales
- Autenticación de sockets con JWT
- Gestión de salas y participantes en tiempo real
- Soporte para chat en tiempo real durante las sesiones

### Componentes Clave

1. **Servidor de Señalización (Socket.IO)**
   - Maneja el descubrimiento de pares en tiempo real
   - Intercambio de ofertas/respuestas SDP entre clientes
   - Intercambio de candidatos ICE para conexiones P2P
   - Autenticación de sockets mediante JWT
   - Gestión de salas de videollamada
   - Sincronización de estado entre participantes

2. **Cliente WebRTC**
   - Implementado con la API WebRTC nativa del navegador
   - Gestión de streams de audio/video con getUserMedia
   - Control de permisos de cámara y micrófono
   - Manejo de conexiones peer-to-peer
   - Soporte para múltiples pistas de medios

3. **Gestión de Sesiones**
   - Estados: programada, en curso, finalizada, cancelada
   - Control de acceso basado en roles (anfitrión, participante, espectador)
   - Registro detallado de participantes y su estado
   - Límites de tiempo configurables por sesión
   - Manejo de reconexiones y recuperación de fallos

4. **Modelo de Datos**
   - Almacenamiento de metadatos de sesión
   - Seguimiento de participantes y su estado
   - Historial de conexiones y desconexiones
   - Registro de eventos importantes

### Flujo de una Videollamada

#### 1. Creación de la Sesión
- **Solicitud**: `POST /api/webrtc/sessions`
  ```json
  {
    "title": "Sesión de Prueba",
    "description": "Descripción opcional",
    "isPrivate": false,
    "maxParticipants": 4,
    "duration": 900000 // 15 minutos en milisegundos
  }
  ```
- **Respuesta**: 
  ```json
  {
    "success": true,
    "data": {
      "_id": "session_id",
      "roomId": "room_123abc",
      "host": "user_id",
      "status": "scheduled",
      "startTime": "2023-08-10T21:00:00.000Z",
      "endTime": "2023-08-10T21:15:00.000Z"
    }
  }
  ```

#### 2. Unión a la Sesión
- **Solicitud**: `POST /api/webrtc/sessions/:id/join`
- **Autenticación**: Requiere token JWT
- **Respuesta**:
  ```json
  {
    "success": true,
    "data": {
      "session": { /* Detalles de la sesión */ },
      "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" },
        // Otros servidores ICE
      ]
    }
  }
  ```

#### 3. Conexión WebSocket
1. **Autenticación del Socket**:
   ```javascript
   const socket = io(SERVER_URL, {
     auth: { token: 'JWT_TOKEN' }
   });
   ```

2. **Unión a la Sala**:
   ```javascript
   socket.emit('join-room', 'room_123abc');
   ```

3. **Manejo de Eventos**:
   ```javascript
   // Cuando un nuevo usuario se conecta
   socket.on('user-connected', ({ userId }) => {
     console.log('Nuevo usuario conectado:', userId);
   });

   // Cuando se recibe una señal WebRTC
   socket.on('signal', ({ signal, from }) => {
     // Procesar señal y establecer conexión P2P
   });
   ```

#### 4. Establecimiento de Conexión WebRTC
1. **Obtener Stream de Medios**:
   ```javascript
   const stream = await navigator.mediaDevices.getUserMedia({
     audio: true,
     video: true
   });
   ```

2. **Crear Conexión P2P**:
   ```javascript
   const peer = new SimplePeer({
     initiator: true,
     stream: stream,
     config: { iceServers }
   });

   // Manejar señales
   peer.on('signal', data => {
     socket.emit('signal', {
       to: targetUserId,
       from: currentUserId,
       signal: data,
       roomId: 'room_123abc'
     });
   });
   ```

#### 5. Finalización de la Sesión
- **Solicitud**: `POST /api/webrtc/sessions/:id/end`
- **Permisos**: Solo el anfitrión puede finalizar la sesión
- **Respuesta**:
  ```json
  {
    "success": true,
    "data": {
      "status": "ended",
      "endTime": "2023-08-10T21:10:00.000Z"
    }
  }
  ```

#### 6. Manejo de Errores y Reconexiones
- **Desconexión Inesperada**:
  - El servidor mantiene la sesión activa por 30 segundos
  - Los usuarios pueden reconectarse a la misma sala
  - Se restablecen las conexiones P2P automáticamente

- **Tiempo Agotado**:
  - La sesión se cierra automáticamente al alcanzar el tiempo límite
  - Se notifica a todos los participantes
  - Se guarda un registro de la sesión completada

### Configuración del Servidor de Señalización
```javascript
// Configuración básica de Socket.IO
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

// Manejo de conexiones
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);
  
  // Unirse a una sala de sesión
  socket.on('join-session', (sessionId, userId) => {
    socket.join(sessionId);
    // Lógica de verificación de acceso
  });
  
  // Señalización WebRTC
  socket.on('signal', (data) => {
    // Reenviar señal a los demás participantes
    socket.to(data.room).emit('signal', data);
  });
  
  // Manejo de desconexión
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

## Sistema de Pagos

### Integración con Stripe
La aplicación utiliza Stripe como principal procesador de pagos, ofreciendo una solución segura y confiable para transacciones en línea.

#### Características Principales
- Procesamiento de pagos con tarjeta de crédito/débito
- Métodos de pago locales e internacionales
- Reembolsos y devoluciones
- Historial detallado de transacciones
- Soporte para múltiples monedas
- Cumplimiento de PCI DSS nivel 1
- Webhooks para notificaciones en tiempo real

### Configuración

#### 1. Crear una cuenta en Stripe
- Registrarse en [Stripe](https://stripe.com)
- Activar la cuenta y completar la verificación
- Obtener las claves de API (clave pública y secreta)

#### 2. Configurar variables de entorno
Agregar las siguientes variables al archivo `.env`:
```
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=usd
STRIPE_SUCCESS_URL=http://localhost:3000/payment/success
STRIPE_CANCEL_URL=http://localhost:3000/payment/cancel
```

#### 3. Configurar Webhooks en el Dashboard de Stripe
1. Ir a Developers > Webhooks
2. Agregar endpoint: `https://tudominio.com/api/payments/webhook`
3. Seleccionar eventos a monitorear:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.succeeded`
   - `charge.failed`
   - `customer.created`
   - `customer.updated`

### Endpoints de la API de Pagos

#### Crear un intento de pago
```
POST /api/payments/create-payment-intent
```
**Cuerpo de la solicitud:**
```json
{
  "amount": 19.99,
  "currency": "usd",
  "description": "Compra de créditos",
  "metadata": {
    "type": "credit_purchase",
    "creditAmount": 100
  }
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "clientSecret": "pi_3NxYZ9JZvKYlo2Cb0QvT...",
  "transactionId": "5f8d7a8b9c6d5e4f3a2b1c0d"
}
```

#### Webhook de Stripe
```
POST /api/payments/webhook
```
Este endpoint es utilizado por Stripe para notificar sobre eventos de pago.

#### Obtener historial de transacciones
```
GET /api/payments/transactions
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "5f8d7a8b9c6d5e4f3a2b1c0d",
      "amount": 19.99,
      "currency": "usd",
      "status": "completed",
      "description": "Compra de créditos",
      "metadata": {
        "type": "credit_purchase",
        "creditAmount": 100
      },
      "createdAt": "2023-10-25T14:30:00Z"
    }
  ]
}
```

### Flujo de Pago en el Frontend

1. **Iniciar el proceso de pago**
   - El usuario selecciona un paquete o servicio
   - La aplicación llama a `/api/payments/create-payment-intent`
   - Se recibe un `clientSecret` de Stripe

2. **Confirmar el pago**
   - Usar el SDK de Stripe.js para confirmar el pago
   ```javascript
   const { error, paymentIntent } = await stripe.confirmCardPayment(
     clientSecret,
     {
       payment_method: {
         card: elements.getElement(CardElement),
         billing_details: {
           name: 'Nombre del Cliente'
         }
       }
     }
   );
   ```

3. **Manejar la respuesta**
   - Si es exitoso, redirigir a la página de éxito
   - Si falla, mostrar el error al usuario

### Seguridad
- Todas las comunicaciones con Stripe usan HTTPS
- Las claves secretas nunca se exponen en el frontend
- Se utiliza el SDK oficial de Stripe para el procesamiento seguro de tarjetas
- Los webhooks están firmados para verificar su autenticidad

### Pruebas
Stripe proporciona tarjetas de prueba para simular diferentes escenarios:
- **Pago exitoso**: `4242 4242 4242 4242`
- **Pago fallido**: `4000 0000 0000 0002`
- **Autenticación 3D Secure**: `4000 0025 0000 3155`

### Manejo de Errores Comunes
- **Tarjeta rechazada**: Mostrar mensaje amigable al usuario
- **Error de red**: Reintentar la operación
- **Tiempo de espera agotado**: Verificar el estado del pago
- **Error en el servidor**: Registrar el error y notificar al equipo

### Monitoreo y Mantenimiento
- Revisar regularmente el dashboard de Stripe
- Monitorear webhooks fallidos
- Mantener actualizada la integración con la última versión del SDK
- Realizar pruebas periódicas del flujo de pago

### Webhooks
Se implementan webhooks para manejar eventos asíncronos de Stripe:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `customer.subscription.updated`

### Ejemplo de Endpoint de Webhook
```javascript
// Ruta para webhooks de Stripe
router.post('/webhook', express.raw({type: 'application/json'}), 
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body, 
        sig, 
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Manejar el evento
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handleSuccessfulPayment(paymentIntent);
        break;
      // Otros casos de manejo de eventos
    }

    res.json({received: true});
  }
);
```

## Variables de Entorno

### Configuración del Servidor
```env
# Servidor
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Base de Datos
MONGO_URI=mongodb://mongodb:27017/tinder-clone
REDIS_URL=redis://redis:6379

# Autenticación
JWT_SECRET=tu_jwt_secreto
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=usd

# PayPal
PAYPAL_CLIENT_ID=tu_client_id
PAYPAL_SECRET=tu_secreto
PAYPAL_ENVIRONMENT=sandbox

# Correo Electrónico
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=usuario
SMTP_PASS=contraseña
EMAIL_FROM=noreply@tinderclone.com

# Almacenamiento
UPLOAD_PATH=./uploads
MAX_FILE_UPLOAD=10485760  # 10MB

# WebRTC
TURN_SERVER_URL=turn:your-turn-server.com
TURN_USERNAME=username
TURN_CREDENTIAL=password

# Otros
RATE_LIMIT_WINDOW_MS=15*60*1000  # 15 minutos
RATE_LIMIT_MAX=100  # 100 peticiones por ventana
```

## Comandos Útiles

### Desarrollo
```bash
# Iniciar en modo desarrollo con recarga en caliente
npm run dev

# Ejecutar pruebas
npm test

# Linter
npm run lint

# Formatear código
npm run format
```

### Docker
```bash
# Construir y levantar contenedores
docker-compose up -d --build

# Detener y eliminar contenedores
docker-compose down

# Ver logs en tiempo real
docker-compose logs -f

# Acceder a la consola del contenedor
docker-compose exec backend bash

# Reconstruir un servicio específico
docker-compose up -d --no-deps --build <servicio>

# Limpiar recursos no utilizados
docker system prune -a
```

### Producción
```bash
# Construir para producción
npm run build

# Iniciar en producción
npm start

# Monitorear logs de producción
pm2 logs

# Hacer backup de la base de datos
docker-compose exec mongodb mongodump --out /data/backup/$(date +%Y%m%d)
```

### Mantenimiento
```bash
# Ver uso de recursos
docker stats

# Ver redes Docker
docker network ls

# Limpiar contenedores detenidos
docker container prune

# Limpiar imágenes no utilizadas
docker image prune -a

# Ver volúmenes
docker volume ls
```

## Notas de Desarrollo

### 10/08/2025 - Actualización de la Documentación
- Completada documentación de WebRTC y sistema de pagos
- Actualizadas variables de entorno
- Agregados comandos útiles para Docker y mantenimiento

### Próximos Pasos
- [x] Implementar autenticación JWT
- [x] Crear modelos de Mongoose
- [x] Desarrollar controladores básicos
- [x] Configurar WebSocket para videollamadas
- [x] Integrar pasarela de pagos
- [ ] Desarrollar frontend básico
- [ ] Implementar pruebas unitarias y de integración
- [ ] Configurar CI/CD
