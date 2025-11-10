#!/bin/bash

echo "═══════════════════════════════════════════════════════════════"
echo "  PostgreSQL Password Reset Script"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "⚠️  PostgreSQL is not running. Starting it..."
    sudo systemctl start postgresql
    sleep 2
fi

# Check if PostgreSQL is now ready
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ Cannot connect to PostgreSQL. Please check the service status."
    exit 1
fi

echo "✅ PostgreSQL is running"
echo ""

# Prompt for new password
echo "Enter new password for PostgreSQL 'postgres' user:"
read -s NEW_PASSWORD
echo ""

if [ -z "$NEW_PASSWORD" ]; then
    echo "❌ Password cannot be empty!"
    exit 1
fi

echo "Confirm new password:"
read -s CONFIRM_PASSWORD
echo ""

if [ "$NEW_PASSWORD" != "$CONFIRM_PASSWORD" ]; then
    echo "❌ Passwords do not match!"
    exit 1
fi

echo ""
echo "🔄 Resetting PostgreSQL password..."

# Method 1: Using psql with ALTER USER (requires current password or trust auth)
# We'll use a temporary pg_hba.conf modification approach

# Create a temporary SQL file
TEMP_SQL=$(mktemp)
cat > "$TEMP_SQL" << EOF
ALTER USER postgres WITH PASSWORD '$NEW_PASSWORD';
\q
EOF

# Try to reset password using sudo -u postgres
echo "Attempting to reset password..."

# Method: Use peer authentication (local connections)
if sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '$NEW_PASSWORD';" 2>/dev/null; then
    echo "✅ Password reset successful!"
    echo ""
    
    # Update .env file if it exists
    ENV_FILE="/mnt/data/GITHUB PERSONAL/fakturera/backend/.env"
    if [ -f "$ENV_FILE" ]; then
        echo "📝 Updating .env file with new password..."
        # Backup original
        cp "$ENV_FILE" "$ENV_FILE.backup"
        
        # Update password in .env
        if grep -q "DB_PASSWORD=" "$ENV_FILE"; then
            # Use a different delimiter to avoid issues with special characters
            sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=$NEW_PASSWORD|" "$ENV_FILE"
            echo "✅ .env file updated!"
        else
            echo "⚠️  DB_PASSWORD not found in .env file. Please add it manually:"
            echo "   DB_PASSWORD=$NEW_PASSWORD"
        fi
    else
        echo "⚠️  .env file not found. Please update it manually:"
        echo "   DB_PASSWORD=$NEW_PASSWORD"
    fi
    
    # Clean up
    rm -f "$TEMP_SQL"
    
    echo ""
    echo "🎉 Password reset complete!"
    echo ""
    echo "Testing connection..."
    sleep 1
    
    # Test connection
    export PGPASSWORD="$NEW_PASSWORD"
    if psql -h localhost -U postgres -d postgres -c "SELECT current_user;" > /dev/null 2>&1; then
        echo "✅ Connection test successful!"
    else
        echo "⚠️  Connection test failed. You may need to update your .env file."
    fi
    unset PGPASSWORD
    
else
    echo "❌ Failed to reset password using standard method."
    echo ""
    echo "Trying alternative method..."
    
    # Alternative: Modify pg_hba.conf temporarily
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  Alternative Method: Manual Reset"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "If the automatic method failed, try this:"
    echo ""
    echo "1. Edit PostgreSQL config to allow local trust:"
    echo "   sudo nano /etc/postgresql/16/main/pg_hba.conf"
    echo ""
    echo "2. Find the line with 'local all postgres' and change it to:"
    echo "   local   all             postgres                                trust"
    echo ""
    echo "3. Restart PostgreSQL:"
    echo "   sudo systemctl restart postgresql"
    echo ""
    echo "4. Reset password:"
    echo "   sudo -u postgres psql -c \"ALTER USER postgres WITH PASSWORD '$NEW_PASSWORD';\""
    echo ""
    echo "5. Restore pg_hba.conf to original (change 'trust' back to 'md5' or 'scram-sha-256')"
    echo "   sudo nano /etc/postgresql/16/main/pg_hba.conf"
    echo ""
    echo "6. Restart PostgreSQL again:"
    echo "   sudo systemctl restart postgresql"
    echo ""
    
    # Clean up
    rm -f "$TEMP_SQL"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Next Steps"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "1. Make sure your .env file has the correct password:"
echo "   DB_PASSWORD=$NEW_PASSWORD"
echo ""
echo "2. Restart your backend server if it's running:"
echo "   The server will automatically reconnect with the new password"
echo ""
echo "3. Test the database connection:"
echo "   curl -X 'GET' 'http://localhost:3001/api/db/test' -H 'accept: application/json'"
echo ""

