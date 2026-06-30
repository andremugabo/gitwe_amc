const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gitwe AMC Platform API',
      version: '1.0.0',
      description:
        'REST API documentation for the Integrated Platform for Church Administration and Record Management — Gitwe Ministerial Centre.',
      contact: {
        name: 'Gitwe AMC Development Team'
      }
    },
    servers: [
      {
        url: 'http://localhost:5001/api',
        description: 'Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter the JWT token obtained from the login endpoint'
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Authentication & account management' },
      { name: 'Members', description: 'Church member records (CRUD)' },
      { name: 'Documents', description: 'Document upload and retrieval' },
      { name: 'Dashboard', description: 'Role-scoped dashboard metrics' },
      { name: 'Hierarchy', description: 'Ecclesiastical location hierarchy' },
      { name: 'Training', description: 'Training courses, sessions, enrollment, certificates' }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };
