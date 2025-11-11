import { sendResponse, sendError } from '../utils/response.js';
import { selectOne } from '../utils/db.js';

export function termsRoutes(req, res, parsedUrl, pathname, method) {
  /**
   * @swagger
   * /api/terms:
   *   get:
   *     summary: Get terms content by language
   *     tags: [Terms]
   *     parameters:
   *       - in: query
   *         name: lang
   *         required: false
   *         schema:
   *           type: string
   *           enum: [en, sv]
   *           default: en
   *         description: Language code (en for English, sv for Swedish)
   *     responses:
   *       200:
   *         description: Terms content retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 language_code:
   *                   type: string
   *                   example: en
   *                 content:
   *                   type: string
   *                   example: Terms content here...
   *       404:
   *         description: Terms not found for the specified language
   *       500:
   *         description: Database error
   */
  if (pathname === '/api/terms' && method === 'GET') {
    const languageCode = parsedUrl.query?.lang || 'en';
    
    const validLanguages = ['en', 'sv'];
    if (!validLanguages.includes(languageCode)) {
      sendError(res, 400, 'Invalid Language', 
        `Language code must be one of: ${validLanguages.join(', ')}`,
        { provided: languageCode }
      );
      return;
    }

    selectOne(
      'SELECT language_code, content, updated_at FROM terms WHERE language_code = $1',
      [languageCode]
    )
      .then(result => {
        if (!result) {
          sendError(res, 404, 'Not Found', 
            `Terms content not found for language: ${languageCode}`);
          return;
        }

        sendResponse(res, 200, {
          language_code: result.language_code,
          content: result.content,
          updated_at: result.updated_at
        });
      })
      .catch(error => {
        console.error('Database error in terms route:', error);
        sendError(res, 500, 'Database Error', error.message);
      });
    return;
  }

  sendError(res, 404, 'Not Found', `Route ${pathname} not found`);
}

