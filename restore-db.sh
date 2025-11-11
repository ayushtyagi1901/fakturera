#!/bin/bash
# Database Restore Script
# Usage: ./restore-db.sh <backup-file.tar.gz>

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <backup-file.tar.gz>"
    echo "Example: $0 gs://fakturera-backups/backups/fakturera_backup_20250101_020000.tar.gz"
    exit 1
fi

BACKUP_FILE="$1"
APP_DIR="/opt/fakturera"
TEMP_FILE="/tmp/restore_backup.tar.gz"

echo "🔄 Restoring database from backup..."

# Download from GCS if it's a gs:// path
if [[ "$BACKUP_FILE" == gs://* ]]; then
    echo "Downloading from GCS..."
    gsutil cp "$BACKUP_FILE" "$TEMP_FILE"
    BACKUP_FILE="$TEMP_FILE"
fi

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  WARNING: This will replace the current database!"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Stop backend to prevent connections
echo "Stopping backend..."
cd "$APP_DIR"
docker-compose stop backend

# Drop and recreate database
echo "Recreating database..."
docker-compose exec -T postgres psql -U fakturera_user -c "DROP DATABASE IF EXISTS fakturera;"
docker-compose exec -T postgres psql -U fakturera_user -c "CREATE DATABASE fakturera;"

# Restore backup
echo "Restoring data..."
gunzip -c "$BACKUP_FILE" | docker-compose exec -T postgres psql -U fakturera_user -d fakturera

# Cleanup temp file if downloaded
if [ "$TEMP_FILE" != "$1" ]; then
    rm -f "$TEMP_FILE"
fi

# Start backend
echo "Starting backend..."
docker-compose start backend

echo "✅ Database restore completed!"

