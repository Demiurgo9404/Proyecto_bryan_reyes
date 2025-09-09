const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const packageJson = require('../../package.json');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LoveRose API',
      version: packageJson.version,
      description: 'Documentación de la API de LoveRose',
      contact: {
        name: 'Soporte Técnico',
        email: 'soporte@loverose.com',
      },
      license: {
        name: 'Propietario',
        url: 'https://loverose.com/terms',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Servidor de desarrollo',
      },
      {
        url: 'https://api.loverose.com/api',
        description: 'Servidor de producción',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingrese el token JWT en el formato: Bearer <token>',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'username', 'password'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único del usuario',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico del usuario',
            },
            username: {
              type: 'string',
              minLength: 3,
              description: 'Nombre de usuario',
            },
            role: {
              type: 'string',
              enum: ['user', 'model', 'admin', 'superadmin'],
              default: 'user',
              description: 'Rol del usuario',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación del usuario',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización del usuario',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            statusCode: {
              type: 'integer',
              format: 'int32',
            },
            message: {
              type: 'string',
            },
            error: {
              type: 'string',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
            path: {
              type: 'string',
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de acceso no válido o expirado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                statusCode: 401,
                message: 'Token inválido o expirado',
                error: 'Unauthorized',
              },
            },
          },
        },
        ValidationError: {
          description: 'Error de validación',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                statusCode: 400,
                message: ['El correo electrónico es requerido'],
                error: 'Bad Request',
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../**/*.route.js'),
    path.join(__dirname, '../**/routes/*.js'),
  ],
};

const specs = swaggerJsdoc(options);

const swaggerDocs = (app, port) => {
  // Ruta para la documentación de Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'LoveRose API Documentation',
    customfavIcon: '/favicon.ico',
  }));

  // Ruta para el JSON de la especificación
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log(`📚 Documentación de la API disponible en http://localhost:${port}/api-docs`);
};

module.exports = { swaggerDocs, specs };
