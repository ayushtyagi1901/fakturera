#!/bin/bash

echo "🚀 Starting PostgreSQL setup..."
echo ""

# Start PostgreSQL service
echo "1️⃣  Starting PostgreSQL service..."
sudo systemctl start postgresql

# Check status
echo ""
echo "2️⃣  Checking PostgreSQL status..."
pg_lsclusters

# Wait a moment for service to start
sleep 2

# Check if PostgreSQL is ready
echo ""
echo "3️⃣  Checking if PostgreSQL is ready..."
if pg_isready -h localhost -p 5432; then
    echo "✅ PostgreSQL is running!"
else
    echo "❌ PostgreSQL is not ready yet. Please check the service status."
    exit 1
fi

# Create database
echo ""
echo "4️⃣  Creating database 'fakturera'..."
sudo -u postgres createdb fakturera 2>/dev/null && echo "✅ Database 'fakturera' created!" || echo "⚠️  Database may already exist (this is OK)"

# Verify database exists
echo ""
echo "5️⃣  Verifying database..."
sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw fakturera && echo "✅ Database 'fakturera' exists!" || echo "❌ Database creation failed"

# Test connection
echo ""
echo "6️⃣  Testing database connection..."
sudo -u postgres psql -d fakturera -c "SELECT current_database(), version();" > /dev/null 2>&1 && echo "✅ Database connection successful!" || echo "❌ Database connection failed"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Now test the API endpoint:"
echo "curl -X 'GET' 'http://localhost:3001/api/db/test' -H 'accept: application/json'"

