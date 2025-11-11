import { sendResponse, sendError } from '../utils/response.js';
import { select, selectOne } from '../utils/db.js';
import { query } from '../config/database.js';

export function productsRoutes(req, res, parsedUrl, pathname, method) {
  /**
   * @swagger
   * /api/products:
   *   get:
   *     summary: Get all products for dashboard
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
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
   *       401:
   *         description: Unauthorized - Missing or invalid JWT token
   *       500:
   *         description: Database error
   */
  if (pathname === '/api/products' && method === 'GET') {
    const languageCode = parsedUrl.query?.lang || 'en';
    
    const validLanguages = ['en', 'sv'];
    if (!validLanguages.includes(languageCode)) {
      sendError(res, 400, 'Invalid Language', 
        `Language code must be one of: ${validLanguages.join(', ')}`,
        { provided: languageCode }
      );
      return;
    }

    const sortColumn = parsedUrl.query?.sort || 'article_no';
    const sortOrder = parsedUrl.query?.order || 'asc';
    
    const validSortColumns = ['article_no', 'name'];
    if (!validSortColumns.includes(sortColumn)) {
      sendError(res, 400, 'Invalid Sort Column', 
        `Sort column must be one of: ${validSortColumns.join(', ')}`,
        { provided: sortColumn }
      );
      return;
    }

    const validSortOrders = ['asc', 'desc'];
    if (!validSortOrders.includes(sortOrder.toLowerCase())) {
      sendError(res, 400, 'Invalid Sort Order', 
        `Sort order must be one of: ${validSortOrders.join(', ')}`,
        { provided: sortOrder }
      );
      return;
    }

    const nameColumn = languageCode === 'sv' ? 'name_sv' : 'name_en';
    const descColumn = languageCode === 'sv' ? 'description_sv' : 'description_en';
    
    let orderBy;
    if (sortColumn === 'name') {
      orderBy = nameColumn;
    } else if (sortColumn === 'article_no') {
      orderBy = `CAST(SUBSTRING(article_no FROM '\\d+') AS INTEGER)`;
    } else {
      orderBy = sortColumn;
    }
    
    const orderDirection = sortOrder.toUpperCase();
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

  /**
   * @swagger
   * /api/products/{id}:
   *   put:
   *     summary: Update a product
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Product ID
   *       - in: query
   *         name: lang
   *         required: false
   *         schema:
   *           type: string
   *           enum: [en, sv]
   *           default: en
   *         description: Language code (en for English, sv for Swedish)
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               in_price:
   *                 type: number
   *               price:
   *                 type: number
   *               unit:
   *                 type: string
   *               in_stock:
   *                 type: integer
   *               description:
   *                 type: string
   *     responses:
   *       200:
   *         description: Product updated successfully
   *       400:
   *         description: Invalid input
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Product not found
   *       500:
   *         description: Database error
   */
  if (pathname.startsWith('/api/products/') && method === 'PUT') {
    const productId = parseInt(pathname.split('/').pop());
    
    if (isNaN(productId)) {
      sendError(res, 400, 'Bad Request', 'Invalid product ID');
      return;
    }

    const languageCode = parsedUrl.query?.lang || 'en';
    
    const validLanguages = ['en', 'sv'];
    if (!validLanguages.includes(languageCode)) {
      sendError(res, 400, 'Invalid Language', 
        `Language code must be one of: ${validLanguages.join(', ')}`,
        { provided: languageCode }
      );
      return;
    }

    const { name, in_price, price, unit, in_stock, description } = req.body || {};

    selectOne('SELECT id FROM products WHERE id = $1', [productId])
      .then(existingProduct => {
        if (!existingProduct) {
          sendError(res, 404, 'Not Found', `Product with ID ${productId} not found`);
          return;
        }

        const nameColumn = languageCode === 'sv' ? 'name_sv' : 'name_en';
        const descColumn = languageCode === 'sv' ? 'description_sv' : 'description_en';
        
        const updates = [];
        const params = [];
        let paramIndex = 1;

        if (name !== undefined) {
          updates.push(`${nameColumn} = $${paramIndex++}`);
          params.push(name);
        }
        if (in_price !== undefined) {
          updates.push(`in_price = $${paramIndex++}`);
          params.push(in_price);
        }
        if (price !== undefined) {
          updates.push(`price = $${paramIndex++}`);
          params.push(price);
        }
        if (unit !== undefined) {
          updates.push(`unit = $${paramIndex++}`);
          params.push(unit);
        }
        if (in_stock !== undefined) {
          updates.push(`in_stock = $${paramIndex++}`);
          params.push(in_stock);
        }
        if (description !== undefined) {
          updates.push(`${descColumn} = $${paramIndex++}`);
          params.push(description);
        }

        if (updates.length === 0) {
          sendError(res, 400, 'Bad Request', 'No fields provided to update');
          return;
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        params.push(productId);

        const updateQuery = `
          UPDATE products 
          SET ${updates.join(', ')}
          WHERE id = $${paramIndex}
          RETURNING 
            id,
            article_no,
            ${nameColumn} as name,
            in_price,
            price,
            unit,
            in_stock,
            ${descColumn} as description
        `;

        query(updateQuery, params)
          .then(result => {
            const updatedProduct = result.rows[0];
            if (!updatedProduct) {
              sendError(res, 500, 'Database Error', 'Failed to update product');
              return;
            }
            sendResponse(res, 200, {
              message: 'Product updated successfully',
              product: updatedProduct
            });
          })
          .catch(error => {
            console.error('Database error updating product:', error);
            sendError(res, 500, 'Database Error', error.message);
          });
      })
      .catch(error => {
        console.error('Database error checking product:', error);
        sendError(res, 500, 'Database Error', error.message);
      });
    return;
  }

  sendError(res, 404, 'Not Found', `Route ${pathname} not found`);
}

