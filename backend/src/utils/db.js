import { query, getClient } from '../config/database.js';

export async function select(sql, params = []) {
  const result = await query(sql, params);
  return result.rows;
}

export async function selectOne(sql, params = []) {
  const result = await query(sql, params);
  return result.rows[0] || null;
}

export async function insert(sql, params = []) {
  const result = await query(sql + ' RETURNING *', params);
  return result.rows[0];
}

export async function update(sql, params = []) {
  const result = await query(sql + ' RETURNING *', params);
  return result.rows[0] || null;
}

export async function remove(sql, params = []) {
  const result = await query(sql + ' RETURNING *', params);
  return result.rows[0] || null;
}

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

