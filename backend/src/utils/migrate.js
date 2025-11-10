import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create migrations table to track applied migrations
 */
async function createMigrationsTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await query(createTableSQL);
}

/**
 * Get list of applied migrations
 */
async function getAppliedMigrations() {
  const result = await query('SELECT filename FROM migrations ORDER BY id');
  return result.rows.map(row => row.filename);
}

/**
 * Mark a migration as applied
 */
async function markMigrationApplied(filename) {
  await query('INSERT INTO migrations (filename) VALUES ($1)', [filename]);
}

/**
 * Read and execute SQL migration file
 */
async function runMigration(filename) {
  const migrationsDir = path.join(__dirname, '../../migrations');
  const filePath = path.join(migrationsDir, filename);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Migration file not found: ${filename}`);
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  
  // Execute the migration
  await query(sql);
  await markMigrationApplied(filename);
  
  console.log(`✅ Applied migration: ${filename}`);
}

/**
 * Run all pending migrations
 */
export async function runMigrations() {
  try {
    // Create migrations table if it doesn't exist
    await createMigrationsTable();

    // Get list of migration files
    const migrationsDir = path.join(__dirname, '../../migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Get applied migrations
    const applied = await getAppliedMigrations();

    // Run pending migrations
    for (const file of files) {
      if (!applied.includes(file)) {
        console.log(`Running migration: ${file}`);
        await runMigration(file);
      } else {
        console.log(`⏭️  Skipping already applied migration: ${file}`);
      }
    }

    console.log('✅ All migrations completed');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
}

