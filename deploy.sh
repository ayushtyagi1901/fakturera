#!/bin/bash
set -e

# Production Deployment Script for Fakturera
# Run as: sudo bash deploy.sh

# Set non-interactive mode for package installations
export DEBIAN_FRONTEND=noninteractive

echo "🚀 Starting Fakturera Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_USER="deployer"
APP_DIR="/opt/fakturera"
REPO_URL="${REPO_URL:-https://github.com/ayushtyagi1901/fakturera.git}"
DOMAIN="${DOMAIN:-your-domain.com}"
EMAIL="${EMAIL:-admin@${DOMAIN}}"
GCS_BUCKET="${GCS_BUCKET:-fakturera-backups}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root/sudo${NC}"
    exit 1
fi

echo -e "${GREEN}Step 1: System Updates${NC}"
apt-get update
apt-get upgrade -y

echo -e "${GREEN}Step 2: Install Required Packages${NC}"
apt-get install -y \
    curl \
    git \
    ufw \
    logrotate \
    cron \
    python3 \
    python3-pip \
    software-properties-common

echo -e "${GREEN}Step 3: Install Docker${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

echo -e "${GREEN}Step 4: Install Docker Compose${NC}"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

echo -e "${GREEN}Step 5: Install Nginx${NC}"
apt-get install -y nginx

echo -e "${GREEN}Step 6: Install Certbot${NC}"
apt-get install -y certbot python3-certbot-nginx

echo -e "${GREEN}Step 7: Install Google Cloud SDK (for backups)${NC}"
if ! command -v gsutil &> /dev/null; then
    echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -
    apt-get update
    apt-get install -y google-cloud-cli
fi

echo -e "${GREEN}Step 8: Create Deploy User${NC}"
if ! id "$DEPLOY_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$DEPLOY_USER"
    usermod -aG docker "$DEPLOY_USER"
    usermod -aG sudo "$DEPLOY_USER"
    echo "$DEPLOY_USER ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
fi

echo -e "${GREEN}Step 9: Setup Application Directory${NC}"
mkdir -p "$APP_DIR"
mkdir -p "$APP_DIR/data/postgres"
mkdir -p "$APP_DIR/backups"
mkdir -p "$APP_DIR/logs"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR"

echo -e "${GREEN}Step 10: Clone/Update Repository${NC}"
if [ ! -d "$APP_DIR/.git" ]; then
    sudo -u "$DEPLOY_USER" git clone "$REPO_URL" "$APP_DIR"
    # Fix git ownership
    chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR/.git"
else
    cd "$APP_DIR"
    # Fix git ownership
    chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR/.git"
    # Add safe directory for git
    sudo -u "$DEPLOY_USER" git config --global --add safe.directory "$APP_DIR" || true
    # Fetch latest changes
    sudo -u "$DEPLOY_USER" git fetch origin || true
    # Try to pull, but don't fail if there are conflicts
    sudo -u "$DEPLOY_USER" git pull origin main || echo -e "${YELLOW}⚠️  Git pull had issues, continuing...${NC}"
fi

echo -e "${GREEN}Step 11: Create/Update Environment Files${NC}"

# Preserve existing passwords if .env files exist
if [ -f "$APP_DIR/backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Backend .env exists, preserving existing values${NC}"
    # Extract existing values
    EXISTING_DB_PASSWORD=$(grep "^DB_PASSWORD=" "$APP_DIR/backend/.env" | cut -d '=' -f2- || echo "")
    EXISTING_JWT_SECRET=$(grep "^JWT_SECRET=" "$APP_DIR/backend/.env" | cut -d '=' -f2- || echo "")
    
    # Use existing or generate new
    DB_PASSWORD_VAL="${EXISTING_DB_PASSWORD:-$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)}"
    JWT_SECRET_VAL="${EXISTING_JWT_SECRET:-$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)}"
else
    # Generate new passwords
    DB_PASSWORD_VAL=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    JWT_SECRET_VAL=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
fi

# Backend .env - only create if doesn't exist, or update non-sensitive values
if [ ! -f "$APP_DIR/backend/.env" ]; then
    cat > "$APP_DIR/backend/.env" <<EOF
NODE_ENV=production
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=fakturera
DB_USER=fakturera_user
DB_PASSWORD=${DB_PASSWORD_VAL}
JWT_SECRET=${JWT_SECRET_VAL}
JWT_EXPIRES_IN=24h
EOF
else
    # Update only if values are missing
    if ! grep -q "^NODE_ENV=" "$APP_DIR/backend/.env"; then
        echo "NODE_ENV=production" >> "$APP_DIR/backend/.env"
    fi
    if ! grep -q "^PORT=" "$APP_DIR/backend/.env"; then
        echo "PORT=3000" >> "$APP_DIR/backend/.env"
    fi
    if ! grep -q "^DB_HOST=" "$APP_DIR/backend/.env"; then
        echo "DB_HOST=postgres" >> "$APP_DIR/backend/.env"
    fi
fi

# Root .env for docker-compose - preserve if exists
if [ ! -f "$APP_DIR/.env" ]; then
    cat > "$APP_DIR/.env" <<EOF
DB_NAME=fakturera
DB_USER=fakturera_user
DB_PASSWORD=${DB_PASSWORD_VAL}
EOF
fi

# Frontend .env - update API URL if domain changed, but preserve if exists
if [ ! -f "$APP_DIR/frontend/.env" ]; then
    cat > "$APP_DIR/frontend/.env" <<EOF
VITE_API_URL=https://${DOMAIN}/api
EOF
else
    # Update API URL if it's still the default
    if grep -q "your-domain.com" "$APP_DIR/frontend/.env" || ! grep -q "VITE_API_URL" "$APP_DIR/frontend/.env"; then
        sed -i "s|VITE_API_URL=.*|VITE_API_URL=https://${DOMAIN}/api|" "$APP_DIR/frontend/.env" || \
        echo "VITE_API_URL=https://${DOMAIN}/api" > "$APP_DIR/frontend/.env"
    fi
fi

# Backup script env - preserve if exists
if [ ! -f "$APP_DIR/.backup-env" ]; then
    cat > "$APP_DIR/.backup-env" <<EOF
GCS_BUCKET=${GCS_BUCKET}
DB_PASSWORD=${DB_PASSWORD_VAL}
EOF
else
    # Update GCS bucket if changed
    if ! grep -q "^GCS_BUCKET=" "$APP_DIR/.backup-env"; then
        echo "GCS_BUCKET=${GCS_BUCKET}" >> "$APP_DIR/.backup-env"
    fi
fi

chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR"

echo -e "${GREEN}Step 12: Setup Nginx Configuration${NC}"
cat > /etc/nginx/sites-available/fakturera <<NGINX_EOF
# HTTP server - redirects to HTTPS after SSL setup
server {
    listen 80;
    server_name ${DOMAIN} _;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Temporary: serve on HTTP until certbot runs
    # After certbot, uncomment redirect below
    # return 301 https://\$server_name\$request_uri;
    
    root /opt/fakturera/frontend/dist;
    index index.html;
    
    # Frontend static files
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "public, max-age=3600";
    }
    
    # Static assets with longer cache
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Swagger documentation
    location /api-docs {
        proxy_pass http://localhost:3000/api-docs;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /swagger.json {
        proxy_pass http://localhost:3000/swagger.json;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # API proxy
    location /api {
        # Handle preflight OPTIONS requests
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin * always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
            add_header Access-Control-Max-Age 3600;
            add_header Content-Type 'text/plain charset=UTF-8';
            add_header Content-Length 0;
            return 204;
        }
        
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        
        # CORS headers for actual requests
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/fakturera /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo -e "${GREEN}Step 13: Install Node.js${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

echo -e "${GREEN}Step 14: Update and Build Frontend${NC}"
cd "$APP_DIR"
sudo -u "$DEPLOY_USER" git pull origin main || echo -e "${YELLOW}⚠️  Git pull had issues, continuing...${NC}"

cd "$APP_DIR/frontend"
echo -e "${YELLOW}Installing dependencies and rebuilding frontend...${NC}"
sudo -u "$DEPLOY_USER" npm install
sudo -u "$DEPLOY_USER" npm run build

echo -e "${GREEN}Step 15: Setup Docker Compose${NC}"
cd "$APP_DIR"
# docker-compose.yml will be created separately

echo -e "${GREEN}Step 16: Setup Backup Script${NC}"
cat > "$APP_DIR/backup-db.sh" <<'BACKUP_EOF'
#!/bin/bash
set -e

APP_DIR="/opt/fakturera"
BACKUP_DIR="$APP_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="fakturera_backup_${TIMESTAMP}.tar.gz"

source "$APP_DIR/.backup-env"

echo "Creating database backup..."

# Create backup
docker exec fakturera-postgres-1 pg_dump -U fakturera_user fakturera | gzip > "$BACKUP_DIR/$BACKUP_FILE"

# Upload to GCS
if [ -n "$GCS_BUCKET" ]; then
    echo "Uploading to GCS bucket: $GCS_BUCKET"
    gsutil cp "$BACKUP_DIR/$BACKUP_FILE" "gs://$GCS_BUCKET/backups/"
    
    # Keep only last 7 days locally
    find "$BACKUP_DIR" -name "fakturera_backup_*.tar.gz" -mtime +7 -delete
    
    # Keep only last 30 days in GCS
    gsutil -m rm "gs://$GCS_BUCKET/backups/fakturera_backup_*.tar.gz" 2>/dev/null || true
    gsutil ls "gs://$GCS_BUCKET/backups/fakturera_backup_*.tar.gz" | tail -n +31 | xargs -r gsutil rm || true
else
    echo "GCS_BUCKET not set, skipping cloud upload"
fi

echo "Backup completed: $BACKUP_FILE"
BACKUP_EOF

chmod +x "$APP_DIR/backup-db.sh"
chown "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR/backup-db.sh"

echo -e "${GREEN}Step 17: Setup Health Check Script${NC}"
cat > "$APP_DIR/health-check.sh" <<'HEALTH_EOF'
#!/bin/bash

APP_DIR="/opt/fakturera"
LOG_FILE="$APP_DIR/logs/health-check.log"

check_container() {
    local container=$1
    if ! docker ps | grep -q "$container"; then
        echo "$(date): Container $container is down, restarting..." >> "$LOG_FILE"
        cd "$APP_DIR"
        docker-compose restart "$container"
        return 1
    fi
    return 0
}

check_service() {
    local url=$1
    local name=$2
    if ! curl -f -s "$url" > /dev/null; then
        echo "$(date): Service $name is not responding" >> "$LOG_FILE"
        return 1
    fi
    return 0
}

# Check containers
check_container "fakturera-backend-1" || exit 1
check_container "fakturera-postgres-1" || exit 1

# Check services
check_service "http://localhost:3000/health" "backend" || exit 1

echo "$(date): All services healthy" >> "$LOG_FILE"
HEALTH_EOF

chmod +x "$APP_DIR/health-check.sh"
chown "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR/health-check.sh"

echo -e "${GREEN}Step 17.5: Setup Update Env Helper Script${NC}"
if [ -f "$APP_DIR/update-env.sh" ]; then
    echo -e "${YELLOW}⚠️  update-env.sh already exists, updating...${NC}"
fi
cat > "$APP_DIR/update-env.sh" <<'UPDATE_ENV_EOF'
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
UPDATE_ENV_EOF

chmod +x "$APP_DIR/update-env.sh"
chown "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR/update-env.sh"

echo -e "${GREEN}Step 18: Setup Cron Jobs${NC}"
cat > /etc/cron.d/fakturera <<CRON_EOF
# Daily database backup at 2 AM
0 2 * * * $DEPLOY_USER $APP_DIR/backup-db.sh >> $APP_DIR/logs/backup.log 2>&1

# Health check every 5 minutes
*/5 * * * * $DEPLOY_USER $APP_DIR/health-check.sh

# Log rotation cleanup
0 0 * * 0 $DEPLOY_USER find $APP_DIR/logs -name "*.log" -mtime +30 -delete
CRON_EOF

echo -e "${GREEN}Step 19: Setup Log Rotation${NC}"
cat > /etc/logrotate.d/fakturera <<LOGROTATE_EOF
$APP_DIR/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 $DEPLOY_USER $DEPLOY_USER
}
LOGROTATE_EOF

echo -e "${GREEN}Step 20: Configure Firewall${NC}"
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

echo -e "${GREEN}Step 21: Secure SSH${NC}"
# Backup original config
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Apply security settings
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# Only restart if config is valid
if sshd -t; then
    systemctl restart sshd
else
    echo -e "${YELLOW}⚠️  SSH config test failed, restoring backup${NC}"
    cp /etc/ssh/sshd_config.backup /etc/ssh/sshd_config
    systemctl restart sshd
fi

echo -e "${GREEN}Step 22: Setup Systemd Service${NC}"
cat > /etc/systemd/system/fakturera.service <<SYSTEMD_EOF
[Unit]
Description=Fakturera Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
User=$DEPLOY_USER
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
Restart=on-failure

[Install]
WantedBy=multi-user.target
SYSTEMD_EOF

systemctl daemon-reload
systemctl enable fakturera

echo -e "${GREEN}Step 23: Start/Restart Application${NC}"
cd "$APP_DIR"
# Check if containers are already running
if sudo -u "$DEPLOY_USER" docker-compose ps | grep -q "Up"; then
    echo -e "${YELLOW}Containers already running, restarting...${NC}"
    sudo -u "$DEPLOY_USER" docker-compose restart
else
    echo -e "${YELLOW}Starting containers...${NC}"
    sudo -u "$DEPLOY_USER" docker-compose up -d --build
fi

echo -e "${GREEN}Step 24: Wait for services to be ready${NC}"
sleep 10

echo -e "${GREEN}Step 25: Run database migrations${NC}"
cd "$APP_DIR/backend"
sudo -u "$DEPLOY_USER" docker-compose exec -T backend npm run migrate || echo "Migrations may have already run"

echo -e "${YELLOW}⚠️  IMPORTANT NEXT STEPS:${NC}"
echo -e "${YELLOW}1. Update domain in /etc/nginx/sites-available/fakturera${NC}"
echo -e "${YELLOW}2. Run: certbot --nginx -d ${DOMAIN}${NC}"
echo -e "${YELLOW}3. Configure GCS bucket: gsutil mb gs://${GCS_BUCKET}${NC}"
echo -e "${YELLOW}4. Authenticate GCS: gcloud auth login${NC}"
echo -e "${YELLOW}5. Test backup: $APP_DIR/backup-db.sh${NC}"

echo -e "${GREEN}✅ Deployment script completed!${NC}"
echo -e "${GREEN}Application should be running at http://$(curl -s ifconfig.me)${NC}"

