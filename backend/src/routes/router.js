import { sendResponse, sendError } from '../utils/response.js';
import { exampleRoutes } from './example.js';
import { databaseExampleRoutes } from './database-example.js';
import { termsRoutes } from './terms.js';
import { productsRoutes } from './products.js';
import { authRoutes, verifyToken } from './auth.js';

export function router(req, res, parsedUrl, pathname, method) {
  /**
   * @swagger
   * /health:
   *   get:
   *     summary: Health check endpoint
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Server is healthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: OK
   *                 message:
   *                   type: string
   *                   example: Server is running
   */
  if (pathname === '/health' && method === 'GET') {
    sendResponse(res, 200, {
      status: 'OK',
      message: 'Server is running',
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (pathname === '/' && method === 'GET') {
    sendResponse(res, 200, {
      message: 'Fakturera API',
      version: '1.0.0',
      docs: '/api-docs'
    });
    return;
  }

  if (pathname.startsWith('/api/example')) {
    exampleRoutes(req, res, parsedUrl, pathname, method);
    return;
  }

  if (pathname.startsWith('/api/db')) {
    databaseExampleRoutes(req, res, parsedUrl, pathname, method);
    return;
  }

  if (pathname.startsWith('/api/terms')) {
    termsRoutes(req, res, parsedUrl, pathname, method);
    return;
  }

  if (pathname.startsWith('/api/auth')) {
    authRoutes(req, res, parsedUrl, pathname, method);
    return;
  }

  if (pathname.startsWith('/api/products')) {
    verifyToken(req, res).then(decoded => {
      if (decoded) {
        productsRoutes(req, res, parsedUrl, pathname, method);
      }
    }).catch(error => {
      console.error('Token verification error:', error);
      sendError(res, 500, 'Internal Server Error', 'Error verifying authentication token');
    });
    return;
  }

  sendError(res, 404, 'Not Found', `Route ${pathname} not found`);
}

