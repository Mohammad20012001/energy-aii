const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger configuration options
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Energy.AI API Documentation',
      version: '1.0.0',
      description: 'API documentation for Energy.AI platform',
      contact: {
        name: 'Energy.AI Support',
        email: 'support@energy-ai.com',
        url: 'https://energy-ai.com/contact'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.energy-ai.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints'
      },
      {
        name: 'Projects',
        description: 'Project management endpoints'
      },
      {
        name: 'Chat',
        description: 'AI chat and conversation endpoints'
      },
      {
        name: 'Calculations',
        description: 'Energy calculation endpoints'
      }
    ]
  },
  apis: [
    './routes/*.js',
    './models/*.js',
    './controllers/*.js',
    './docs/*.yaml'
  ]
};

// Initialize Swagger
const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Swagger UI options
const swaggerUiOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Energy.AI API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    docExpansion: 'none',
    filter: true,
    persistAuthorization: true
  }
};

module.exports = {
  swaggerDocs,
  swaggerUi,
  swaggerUiOptions
};
