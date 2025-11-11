FROM node:20-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files (explicitly include package-lock.json if it exists)
COPY package.json ./
COPY package-lock.json* ./

# Install dependencies
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev; \
    else \
      npm install --omit=dev && npm cache clean --force; \
    fi

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p /app/logs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["node", "src/server.js"]

