const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Planeación Didáctica - API',
      version: '1.0.0',
      description: 'API para el sistema de gestión de planeación didáctica con roles de administrador, coordinador y profesor',
      contact: {
        name: 'Soporte API',
        email: 'soporte@escuela.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Servidor de Desarrollo'
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de error'
            }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }],
  },
  apis: ['./docs/paths/*.js', './docs/schemas/*.js'], // archivos que contienen la documentación
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };