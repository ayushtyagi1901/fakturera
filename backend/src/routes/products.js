import { sendResponse, sendError } from '../utils/response.js';
import { select } from '../utils/db.js';

/**
 * Products/Dashboard routes handler
 */
export function productsRoutes(req, res, parsedUrl, pathname, method) {
  /**
   * @swagger
   * /api/products:
   *   get:
   *     summary: Get all products for dashboard
   *     tags: [Products]
   *     parameters:
   *       - in: query
   *         name: lang
   *         required: false
   *         schema:
   *           type: string
   *           enum: [en, sv]
   *           default: en
   *         description: Language code (en for English, sv for Swedish)
   *       - in: query
   *         name: sort
   *         required: false
   *         schema:
   *           type: string
   *           enum: [article_no, name]
   *         description: Sort by column (article_no or name)
   *       - in: query
   *         name: order
   *         required: false
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: asc
   *         description: Sort order (asc or desc)
   *     responses:
   *       200:
   *         description: Products retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 products:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                       article_no:
   *                         type: string
   *                       name:
   *                         type: string
   *                       in_price:
   *                         type: number
   *                       price:
   *                         type: number
   *                       unit:
   *                         type: string
   *                       in_stock:
   *                         type: integer
   *                       description:
   *                         type: string
   *       500:
   *         description: Database error
   */
  if (pathname === '/api/products' && method === 'GET') {
    // Get language from query parameter, default to 'en'
    const languageCode = parsedUrl.query?.lang || 'en';
    
    // Validate language code
    const validLanguages = ['en', 'sv'];
    if (!validLanguages.includes(languageCode)) {
      sendError(res, 400, 'Invalid Language', 
        `Language code must be one of: ${validLanguages.join(', ')}`,
        { provided: languageCode }
      );
      return;
    }

    // Get sort parameters
    const sortColumn = parsedUrl.query?.sort || 'article_no';
    const sortOrder = parsedUrl.query?.order || 'asc';
    
    // Validate sort column
    const validSortColumns = ['article_no', 'name'];
    if (!validSortColumns.includes(sortColumn)) {
      sendError(res, 400, 'Invalid Sort Column', 
        `Sort column must be one of: ${validSortColumns.join(', ')}`,
        { provided: sortColumn }
      );
      return;
    }

    // Validate sort order
    const validSortOrders = ['asc', 'desc'];
    if (!validSortOrders.includes(sortOrder.toLowerCase())) {
      sendError(res, 400, 'Invalid Sort Order', 
        `Sort order must be one of: ${validSortOrders.join(', ')}`,
        { provided: sortOrder }
      );
      return;
    }

    // Build query based on language
    const nameColumn = languageCode === 'sv' ? 'name_sv' : 'name_en';
    const descColumn = languageCode === 'sv' ? 'description_sv' : 'description_en';
    
    // Build ORDER BY clause
    let orderBy;
    if (sortColumn === 'name') {
      orderBy = nameColumn;
    } else if (sortColumn === 'article_no') {
      // For article_no, extract numeric part for proper numerical sorting
      // This handles formats like "ART-001", "ART-010", etc.
      orderBy = `CAST(SUBSTRING(article_no FROM '\\d+') AS INTEGER)`;
    } else {
      orderBy = sortColumn;
    }
    
    const orderDirection = sortOrder.toUpperCase();

    // Query database for products
    select(
      `SELECT 
        id,
        article_no,
        ${nameColumn} as name,
        in_price,
        price,
        unit,
        in_stock,
        ${descColumn} as description
      FROM products 
      ORDER BY ${orderBy} ${orderDirection}, article_no ${orderDirection}`
    )
      .then(results => {
        sendResponse(res, 200, {
          language_code: languageCode,
          products: results,
          count: results.length
        });
      })
      .catch(error => {
        console.error('Database error in products route:', error);
        sendError(res, 500, 'Database Error', error.message);
      });
    return;
  }

  // 404 for products routes
  sendError(res, 404, 'Not Found', `Route ${pathname} not found`);
}

