#!/bin/bash
# Helper script to update .env files on the deployed server
# Usage: sudo bash update-env.sh [backend|frontend|root]

set -e

APP_DIR="/opt/fakturera"
DEPLOY_USER="deployer"

if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root/sudo"
    exit 1
fi

ENV_TYPE="${1:-backend}"

case "$ENV_TYPE" in
    backend)
        ENV_FILE="$APP_DIR/backend/.env"
        echo "📝 Opening backend .env file: $ENV_FILE"
        echo "   (Owned by $DEPLOY_USER user)"
        ;;
    frontend)
        ENV_FILE="$APP_DIR/frontend/.env"
        echo "📝 Opening frontend .env file: $ENV_FILE"
        echo "   (Owned by $DEPLOY_USER user)"
        ;;
    root)
        ENV_FILE="$APP_DIR/.env"
        echo "📝 Opening root .env file: $ENV_FILE"
        echo "   (Owned by $DEPLOY_USER user)"
        ;;
    *)
        echo "❌ Invalid option: $ENV_TYPE"
        echo "Usage: sudo bash update-env.sh [backend|frontend|root]"
        exit 1
        ;;
esac

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ File not found: $ENV_FILE"
    exit 1
fi

# Check current editor
EDITOR="${EDITOR:-nano}"

echo ""
echo "💡 Tip: After editing, you may need to:"
echo "   - Restart backend: cd $APP_DIR && sudo -u $DEPLOY_USER docker-compose restart backend"
echo "   - Rebuild frontend: cd $APP_DIR/frontend && sudo -u $DEPLOY_USER npm run build"
echo ""
echo "Press Enter to open the file..."
read

# Edit the file as the deployer user to maintain permissions
sudo -u "$DEPLOY_USER" "$EDITOR" "$ENV_FILE"

echo ""
echo "✅ File updated successfully!"
echo ""
echo "Current file permissions:"
ls -la "$ENV_FILE"

