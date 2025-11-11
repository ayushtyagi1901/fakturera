-- Create users table for authentication
-- Note: Currently using hardcoded credentials in auth.js
-- This table is created for future use when implementing database-backed authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Note: Authentication currently uses hardcoded credentials (username: 'user', password: 'user123')
-- See backend/src/routes/auth.js for the login implementation

