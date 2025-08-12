# LoveRose - Aplicación de Citas con Videollamadas

LoveRose es una plataforma de citas moderna que combina perfiles de usuario con la emoción de las videollamadas en vivo. Conecta con personas afines y descubre nuevas relaciones de manera interactiva.

## Características principales

- Perfiles de usuario con verificación
- Sistema de matches interactivo
- Videollamadas en vivo de 15 segundos
- Contenido exclusivo para suscriptores
- Sistema de pagos seguro
- Chat en tiempo real

## Requisitos Previos

- Node.js (v14 o superior)
- npm (v6 o superior) o yarn
- PostgreSQL (v12 o superior) instalado localmente
- Cuenta de Twilio (para el servicio de videollamadas)
- Redis (opcional, para caché y colas)

## Instalación

1. Clona este repositorio:
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd [NOMBRE_DEL_REPOSITORIO]
   ```

2. Instala las dependencias del servidor y del cliente:
   ```bash
   # Instalar dependencias del servidor
   cd server
   npm install
   
   # Instalar dependencias del cliente
   cd ../client
   npm install
   ```

3. Configura la base de datos PostgreSQL:
   - Crea una base de datos llamada `love_rose_db`
   - Asegúrate de que el usuario de PostgreSQL tenga los permisos necesarios

4. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Servidor
NODE_ENV=development
PORT=5000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario_postgres
DB_PASSWORD=tu_contraseña_postgres
DB_NAME=love_rose_db

# JWT
JWT_SECRET=tu_jwt_secreto_aqui
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Stripe (opcional)
STRIPE_SECRET_KEY=tu_clave_secreta_de_stripe
STRIPE_WEBHOOK_SECRET=tu_webhook_secreto

# PayPal (opcional)
PAYMENT_GATEWAY_API_KEY=tu_api_key_aqui

# Twilio (para videollamadas)
TWILIO_ACCOUNT_SID=tu_sid_de_twilio
TWILIO_AUTH_TOKEN=tu_token_de_autenticacion_twilio
TWILIO_API_KEY=tu_api_key_de_twilio
TWILIO_API_SECRET=tu_secreto_de_api_twilio

# Configuración de la aplicación
FRONTEND_URL=http://localhost:3000
UPLOAD_PATH=./uploads
MAX_FILE_UPLOAD=10000000 # 10MB

# Redis (opcional)
REDIS_URL=redis://localhost:6379
```

5. Inicializa la base de datos:
   ```bash
   # Desde el directorio del servidor
   cd server
   npm run db:init
   ```

6. Inicia el servidor y el cliente:
   ```bash
   # En una terminal, inicia el servidor
   cd server
   npm run server
   
   # En otra terminal, inicia el cliente
   cd ../client
   npm start
   ```

7. Accede a la aplicación en [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

```
.
├── client/                 # Aplicación frontend en React
├── server/                 # API en Node.js/Express
│   ├── config/             # Archivos de configuración
│   ├── controllers/        # Controladores de la API
│   ├── middleware/         # Middlewares de Express
│   ├── models/             # Modelos de Sequelize
│   ├── routes/             # Rutas de la API
│   ├── scripts/            # Scripts de inicialización
│   └── utils/              # Utilidades
├── .env                   # Variables de entorno
└── README.md              # Este archivo
```

## Scripts Disponibles

### En el directorio del servidor (`/server`):
- `npm start` - Inicia el servidor en producción
- `npm run server` - Inicia el servidor en modo desarrollo con nodemon
- `npm run db:init` - Inicializa la base de datos
- `npm run db:migrate` - Ejecuta migraciones de la base de datos
- `npm run db:seed` - Ejecuta los seeders de la base de datos
- `npm test` - Ejecuta las pruebas

### En el directorio del cliente (`/client`):
- `npm start` - Inicia la aplicación en modo desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm test` - Ejecuta las pruebas

## Configuración de la Base de Datos

1. Asegúrate de tener PostgreSQL instalado y en ejecución
2. Crea una base de datos vacía llamada `tinder_clone`
3. Actualiza las credenciales en el archivo `.env` según tu configuración
4. Ejecuta `npm run db:init` para crear las tablas necesarias

## Despliegue en Producción

Para desplegar la aplicación en producción:

1. Configura las variables de entorno en el archivo `.env` con valores de producción
2. Configura un servidor web como Nginx o Apache como proxy inverso
3. Configura PM2 o similar para gestionar el proceso de Node.js
4. Configura SSL con Let's Encrypt para conexiones seguras
5. Asegúrate de que todos los servicios (PostgreSQL, Redis, etc.) estén correctamente configurados y seguros

## Solución de Problemas

- **Error de conexión a la base de datos**: Verifica que PostgreSQL esté en ejecución y que las credenciales en `.env` sean correctas.
- **Problemas de migración**: Ejecuta `npm run db:migrate:undo` para deshacer la última migración y luego `npm run db:migrate` para volver a aplicarla.
- **Problemas con dependencias**: Elimina la carpeta `node_modules` y el archivo `package-lock.json`, luego ejecuta `npm install`.

## Licencia

Este proyecto está bajo la Licencia MIT.
