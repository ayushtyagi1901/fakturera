import { sendResponse, sendError } from '../utils/response.js';
import { select, selectOne } from '../utils/db.js';

/**
 * Example database routes handler
 */
export function databaseExampleRoutes(req, res, parsedUrl, pathname, method) {
  /**
   * @swagger
   * /api/db/test:
   *   get:
   *     summary: Test database connection
   *     tags: [Database]
   *     responses:
   *       200:
   *         description: Database connection successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 timestamp:
   *                   type: string
   */
  if (pathname === '/api/db/test' && method === 'GET') {
    // Example: Query current database time
    selectOne('SELECT NOW() as current_time')
      .then(result => {
        sendResponse(res, 200, {
          message: 'Database connection successful',
          timestamp: result?.current_time || new Date().toISOString(),
          database: 'connected'
        });
      })
      .catch(error => {
        // Provide helpful error message
        const errorMessage = error.message || 'Unknown database error';
        const isConnectionError = errorMessage.includes('ECONNREFUSED') || 
                                  errorMessage.includes('connection') ||
                                  errorMessage.includes('timeout');
        
        sendError(res, 500, 'Database Error', 
          isConnectionError 
            ? 'PostgreSQL is not running or not accessible. Please start PostgreSQL service.'
            : errorMessage,
          {
            hint: isConnectionError 
              ? 'Run: sudo systemctl start postgresql' 
              : 'Check your database configuration in .env file'
          }
        );
      });
    return;
  }

  // 404 for database example routes
  sendError(res, 404, 'Not Found', `Route ${pathname} not found`);
}

