import http from 'http';
import url from 'url';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerOptions } from './config/swagger.js';
import { router } from './routes/router.js';
import { testConnection } from './config/database.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Generate Swagger specification
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Parse request body for POST/PUT requests
  let body = '';
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        req.body = body ? JSON.parse(body) : {};
        handleRequest(req, res, parsedUrl, pathname, method);
      } catch (error) {
        sendResponse(res, 400, { error: 'Invalid JSON' });
      }
    });
  } else {
    handleRequest(req, res, parsedUrl, pathname, method);
  }
});

function handleRequest(req, res, parsedUrl, pathname, method) {
  // Swagger UI endpoint
  if (pathname === '/api-docs') {
    const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fakturera API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #fafafa;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '/swagger.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>`;
    sendResponse(res, 200, swaggerHtml, 'text/html');
    return;
  }

  // Swagger JSON endpoint
  if (pathname === '/swagger.json') {
    // Dynamically set server URL based on request host
    // When behind Nginx, use X-Forwarded-Host or Host header
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || (req.connection?.encrypted ? 'https' : 'http');
    
    // Remove port if it's the default HTTP/HTTPS port
    let baseUrl = `${protocol}://${host}`;
    if ((protocol === 'http' && host.endsWith(':80')) || (protocol === 'https' && host.endsWith(':443'))) {
      baseUrl = `${protocol}://${host.replace(/:(80|443)$/, '')}`;
    }
    
    // Clone swagger spec and update server URLs
    const dynamicSwaggerSpec = JSON.parse(JSON.stringify(swaggerSpec));
    dynamicSwaggerSpec.servers = [
      {
        url: baseUrl,
        description: 'Current server'
      },
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Local development'
      }
    ];
    
    sendResponse(res, 200, dynamicSwaggerSpec);
    return;
  }

  // Route to router
  router(req, res, parsedUrl, pathname, method);
}

function sendResponse(res, statusCode, data, contentType = 'application/json') {
  res.setHeader('Content-Type', contentType);
  res.writeHead(statusCode);
  const response = contentType === 'application/json' ? JSON.stringify(data) : data;
  res.end(response);
}

// Start server
server.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
  
  // Test database connection
  await testConnection();
});

export default server;
