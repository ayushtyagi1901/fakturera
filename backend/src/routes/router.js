import { sendResponse, sendError } from '../utils/response.js';
import { exampleRoutes } from './example.js';
import { databaseExampleRoutes } from './database-example.js';
import { termsRoutes } from './terms.js';
import { productsRoutes } from './products.js';
import { authRoutes, verifyToken } from './auth.js';

/**
 * Main router function that handles all routes
 */
export function router(req, res, parsedUrl, pathname, method) {
  // Health check endpoint
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

  // Root endpoint
  if (pathname === '/' && method === 'GET') {
    sendResponse(res, 200, {
      message: 'Fakturera API',
      version: '1.0.0',
      docs: '/api-docs'
    });
    return;
  }

  // Example routes
  if (pathname.startsWith('/api/example')) {
    exampleRoutes(req, res, parsedUrl, pathname, method);
    return;
  }

  // Database example routes
  if (pathname.startsWith('/api/db')) {
    databaseExampleRoutes(req, res, parsedUrl, pathname, method);
    return;
  }

  // Terms routes
  if (pathname.startsWith('/api/terms')) {
    termsRoutes(req, res, parsedUrl, pathname, method);
    return;
  }

  // Auth routes (login, verify - no auth required)
  if (pathname.startsWith('/api/auth')) {
    authRoutes(req, res, parsedUrl, pathname, method);
    return;
  }

  // Products routes (protected - require authentication)
  if (pathname.startsWith('/api/products')) {
    // Verify token before processing
    verifyToken(req, res).then(decoded => {
      if (decoded) {
        // Token is valid, proceed with route handler
        productsRoutes(req, res, parsedUrl, pathname, method);
      }
      // If token is invalid, verifyToken already sent error response
      // and decoded will be null, so we don't proceed
    }).catch(error => {
      // Handle any unexpected errors during token verification
      console.error('Token verification error:', error);
      sendError(res, 500, 'Internal Server Error', 'Error verifying authentication token');
    });
    return;
  }

  // 404 Not Found
  sendError(res, 404, 'Not Found', `Route ${pathname} not found`);
}

