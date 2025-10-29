const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Planeación Didáctica - API',
      version: '1.0.0',
      description: `
# Sistema de Gestión de Planeación Didáctica

## Descripción
API para el sistema de gestión de planeación didáctica con tres tipos de usuarios:
- **Administrador**: Gestión completa de usuarios y sistema
- **Coordinador**: Revisión y aprobación de planeaciones y evidencias
- **Profesor**: Registro de planeaciones, avances y evidencias

## Autenticación
Todos los endpoints (excepto login) requieren autenticación JWT.
Incluye el token en el header: \`Authorization: Bearer <token>\`

## Roles y Permisos
- **Solo Admin**: Registrar usuarios, eliminar usuarios
- **Admin/Coordinador**: Ver todos los usuarios, revisar planeaciones, revisar evidencias, generar reportes
- **Solo Profesor**: Crear sus planeaciones, registrar sus avances, subir sus evidencias
      `,
      contact: {
        name: 'Soporte API',
        email: 'soporte@escuela.com'
      },
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html'
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
          description: 'Ingrese el token JWT en el formato: Bearer <token>'
        },
      },
    },
    security: [{
      bearerAuth: []
    }],
  },
  apis: [
    './src/docs/schemas/*.js', // Esquemas primero
    './src/routes/*.js'        // Rutas después
  ],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };