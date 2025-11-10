import dotenv from 'dotenv';
dotenv.config();

export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fakturera API',
      version: '1.0.0',
      description: 'API documentation for Fakturera application',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
      {
        url: 'https://api.fakturera.se',
        description: 'Production server',
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
    },
  },
  apis: ['./src/routes/*.js', './src/routes/router.js'], // Path to the API files
};

