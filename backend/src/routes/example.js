import { sendResponse, sendError } from '../utils/response.js';

/**
 * Example routes handler
 */
export function exampleRoutes(req, res, parsedUrl, pathname, method) {
  /**
   * @swagger
   * /api/example:
   *   get:
   *     summary: Get example data
   *     tags: [Example]
   *     responses:
   *       200:
   *         description: Success response
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: This is an example endpoint
   */
  if (pathname === '/api/example' && method === 'GET') {
    sendResponse(res, 200, {
      message: 'This is an example endpoint',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // 404 for example routes
  sendError(res, 404, 'Not Found', `Route ${pathname} not found`);
}
