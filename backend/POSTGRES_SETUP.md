# PostgreSQL Setup Guide

## Current Status
- ✅ PostgreSQL is installed (version 16)
- ❌ PostgreSQL service is **DOWN**
- ❌ Database 'fakturera' does not exist

## Steps to Fix

### 1. Start PostgreSQL Service

Run this command in your terminal:

```bash
sudo systemctl start postgresql
```

Or using pg_ctlcluster:

```bash
sudo pg_ctlcluster 16 main start
```

### 2. Verify PostgreSQL is Running

```bash
pg_lsclusters
```

You should see `Status: online` instead of `down`.

### 3. Create the Database

```bash
sudo -u postgres createdb fakturera
```

Or connect and create manually:

```bash
sudo -u postgres psql
CREATE DATABASE fakturera;
\q
```

### 4. Verify Database Connection

```bash
psql -h localhost -U postgres -d fakturera -c "SELECT version();"
```

### 5. Update .env File (if needed)

If your PostgreSQL `postgres` user has a password, update `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fakturera
DB_USER=postgres
DB_PASSWORD=your_actual_password
```

### 6. Test the API Endpoint

After starting PostgreSQL, test the endpoint:

```bash
curl -X 'GET' 'http://localhost:3001/api/db/test' -H 'accept: application/json'
```

You should get a successful response with database timestamp.

## Quick One-Liner

If you have sudo access, run all setup commands at once:

```bash
sudo systemctl start postgresql && \
sudo -u postgres createdb fakturera && \
echo "✅ PostgreSQL is ready!"
```

## Troubleshooting

### If you get "password authentication failed"

1. Check if postgres user has a password:
   ```bash
   sudo -u postgres psql -c "\du"
   ```

2. If password is required, update `.env` with the correct password

3. Or reset postgres password:
   ```bash
   sudo -u postgres psql
   ALTER USER postgres PASSWORD 'newpassword';
   \q
   ```

### If PostgreSQL won't start

Check the logs:
```bash
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

### Alternative: Use Docker PostgreSQL

If you prefer using Docker:

```bash
docker run --name fakturera-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=fakturera \
  -p 5432:5432 \
  -d postgres:16
```

Then update `.env`:
```env
DB_PASSWORD=postgres
```

