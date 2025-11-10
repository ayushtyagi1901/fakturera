# Fakturera Backend API

Backend API server for the Fakturera application built with pure Node.js (no frameworks).

## Features

- Pure Node.js HTTP server (no Express)
- PostgreSQL database with connection pooling
- Swagger/OpenAPI documentation
- CORS enabled
- Environment variable configuration
- Modular routing system
- Database migration system

## Getting Started

### Prerequisites

- Node.js (v18 or higher) - uses built-in `http` module
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up PostgreSQL database:
```bash
# Create database
createdb fakturera

# Or using psql
psql -U postgres
CREATE DATABASE fakturera;
```

3. Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your PostgreSQL configuration:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fakturera
DB_USER=postgres
DB_PASSWORD=your_password
```

### Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Documentation

Once the server is running, you can access the Swagger API documentation at:
- http://localhost:3000/api-docs

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # PostgreSQL connection pool
│   │   └── swagger.js   # Swagger configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── routes/         # API routes
│   │   ├── router.js   # Main router
│   │   └── example.js  # Example routes
│   ├── utils/          # Utility functions
│   │   ├── db.js       # Database helper functions
│   │   ├── migrate.js  # Migration runner
│   │   └── response.js # Response helpers
│   └── server.js       # Main HTTP server
├── migrations/         # SQL migration files
│   └── 001_initial_schema.sql
├── .env.example        # Example environment variables
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints

### Health Check
- `GET /health` - Check server health status

### Documentation
- `GET /api-docs` - Swagger UI documentation

## Database

### Connection

The server automatically tests the database connection on startup. The connection pool is configured in `src/config/database.js`.

### Database Utilities

Use the helper functions in `src/utils/db.js` for database operations:

```javascript
import { select, selectOne, insert, update, remove, transaction } from '../utils/db.js';

// Select multiple rows
const users = await select('SELECT * FROM users WHERE active = $1', [true]);

// Select single row
const user = await selectOne('SELECT * FROM users WHERE id = $1', [userId]);

// Insert
const newUser = await insert(
  'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
  [email, passwordHash]
);

// Update
const updated = await update(
  'UPDATE users SET email = $1 WHERE id = $2',
  [newEmail, userId]
);

// Delete
const deleted = await remove('DELETE FROM users WHERE id = $1', [userId]);

// Transaction
await transaction(async (client) => {
  await client.query('INSERT INTO users ...');
  await client.query('INSERT INTO profiles ...');
});
```

### Migrations

Migrations are SQL files in the `migrations/` directory. They are automatically applied in alphabetical order.

To run migrations manually:
```javascript
import { runMigrations } from './src/utils/migrate.js';
await runMigrations();
```

Or add a script to `package.json`:
```json
{
  "scripts": {
    "migrate": "node -e \"import('./src/utils/migrate.js').then(m => m.runMigrations())\""
  }
}
```

## Development

To add new API endpoints:

1. Create a route handler function in `src/routes/`
2. Import and register the route in `src/routes/router.js`
3. Add Swagger documentation using JSDoc comments

Example route with Swagger documentation:
```javascript
// In src/routes/example.js
import { sendResponse } from '../utils/response.js';

export function exampleRoutes(req, res, parsedUrl, pathname, method) {
  /**
   * @swagger
   * /api/example:
   *   get:
   *     summary: Get example data
   *     tags: [Example]
   *     responses:
   *       200:
   *         description: Success
   */
  if (pathname === '/api/example' && method === 'GET') {
    sendResponse(res, 200, { message: 'Success' });
    return;
  }
}
```

Then register it in `src/routes/router.js`:
```javascript
import { exampleRoutes } from './example.js';

export function router(req, res, parsedUrl, pathname, method) {
  if (pathname.startsWith('/api/example')) {
    exampleRoutes(req, res, parsedUrl, pathname, method);
    return;
  }
  // ... other routes
}
```

## License

ISC

