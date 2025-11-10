#!/bin/bash

# Alternative manual method if the automatic one doesn't work
# This script uses pg_hba.conf modification

echo "═══════════════════════════════════════════════════════════════"
echo "  PostgreSQL Password Reset (Manual Method)"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "This script will temporarily modify pg_hba.conf to allow"
echo "password reset without knowing the current password."
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

PG_HBA="/etc/postgresql/16/main/pg_hba.conf"
BACKUP_FILE="${PG_HBA}.backup.$(date +%Y%m%d_%H%M%S)"

echo "📋 Backing up pg_hba.conf to: $BACKUP_FILE"
sudo cp "$PG_HBA" "$BACKUP_FILE"

echo "🔧 Modifying pg_hba.conf to allow trust authentication..."
# Find and modify the local postgres line
sudo sed -i 's/^local.*postgres.*$/local   all             postgres                                trust/' "$PG_HBA"

echo "🔄 Restarting PostgreSQL..."
sudo systemctl restart postgresql
sleep 2

echo "🔑 Resetting password..."
if sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '$NEW_PASSWORD';" 2>/dev/null; then
    echo "✅ Password reset successful!"
    
    echo "🔧 Restoring pg_hba.conf to use password authentication..."
    # Restore to use scram-sha-256 (modern PostgreSQL default)
    sudo sed -i 's/^local.*postgres.*trust.*$/local   all             postgres                                scram-sha-256/' "$PG_HBA"
    
    echo "🔄 Restarting PostgreSQL again..."
    sudo systemctl restart postgresql
    sleep 2
    
    echo "✅ Configuration restored!"
    
    # Update .env file
    ENV_FILE="/mnt/data/GITHUB PERSONAL/fakturera/backend/.env"
    if [ -f "$ENV_FILE" ]; then
        echo "📝 Updating .env file..."
        cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
        sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=$NEW_PASSWORD|" "$ENV_FILE"
        echo "✅ .env file updated!"
    fi
    
    echo ""
    echo "🎉 Password reset complete!"
    echo ""
    echo "New password: $NEW_PASSWORD"
    echo "(Saved to .env file)"
    
else
    echo "❌ Failed to reset password. Restoring backup..."
    sudo cp "$BACKUP_FILE" "$PG_HBA"
    sudo systemctl restart postgresql
    echo "⚠️  Configuration restored to original state."
    exit 1
fi

