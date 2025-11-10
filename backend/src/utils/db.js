import { query, getClient } from '../config/database.js';

/**
 * Execute a SELECT query and return rows
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Array of rows
 */
export async function select(sql, params = []) {
  const result = await query(sql, params);
  return result.rows;
}

/**
 * Execute a SELECT query and return a single row
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>} Single row or null
 */
export async function selectOne(sql, params = []) {
  const result = await query(sql, params);
  return result.rows[0] || null;
}

/**
 * Execute an INSERT query and return the inserted row
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Inserted row
 */
export async function insert(sql, params = []) {
  const result = await query(sql + ' RETURNING *', params);
  return result.rows[0];
}

/**
 * Execute an UPDATE query and return the updated row
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>} Updated row or null
 */
export async function update(sql, params = []) {
  const result = await query(sql + ' RETURNING *', params);
  return result.rows[0] || null;
}

/**
 * Execute a DELETE query and return the deleted row
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>} Deleted row or null
 */
export async function remove(sql, params = []) {
  const result = await query(sql + ' RETURNING *', params);
  return result.rows[0] || null;
}

/**
 * Execute a transaction
 * @param {Function} callback - Async function that receives a client and performs queries
 * @returns {Promise<any>} Result of the callback
 */
export async function transaction(callback) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

