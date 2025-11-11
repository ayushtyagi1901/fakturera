import { sendResponse, sendError } from '../utils/response.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export function authRoutes(req, res, parsedUrl, pathname, method) {
  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: User login
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *                 example: user
   *               password:
   *                 type: string
   *                 example: user123
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     username:
   *                       type: string
   *       401:
   *         description: Invalid credentials
   *       500:
   *         description: Server error
   */
  if (pathname === '/api/auth/login' && method === 'POST') {
    const { username, password } = req.body || {};

    if (!username || !password) {
      sendError(res, 400, 'Bad Request', 'Username and password are required');
      return;
    }

    if (username === 'user' && password === 'user123') {
      const user = {
        id: 1,
        username: 'user'
      };

      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      sendResponse(res, 200, {
        token,
        user: {
          id: user.id,
          username: user.username
        }
      });
      return;
    }

    sendError(res, 401, 'Unauthorized', 'Invalid username or password');
    return;
  }

  /**
   * @swagger
   * /api/auth/verify:
   *   get:
   *     summary: Verify JWT token
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Token is valid
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 valid:
   *                   type: boolean
   *                 user:
   *                   type: object
   *       401:
   *         description: Invalid or missing token
   */
  if (pathname === '/api/auth/verify' && method === 'GET') {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 401, 'Unauthorized', 'Missing or invalid authorization header');
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      sendResponse(res, 200, {
        valid: true,
        user: {
          id: decoded.id,
          username: decoded.username
        }
      });
    } catch (error) {
      sendError(res, 401, 'Unauthorized', 'Invalid or expired token');
    }
    return;
  }

  sendError(res, 404, 'Not Found', `Route ${pathname} not found`);
}

export async function verifyToken(req, res) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 401, 'Unauthorized', 'Missing or invalid authorization header');
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    sendError(res, 401, 'Unauthorized', 'Invalid or expired token');
    return null;
  }
}

