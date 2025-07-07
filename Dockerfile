# Multi-stage build für AppleJuice Nexus

# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Package files kopieren
COPY package*.json ./

# Dependencies installieren
RUN npm install

# Source code kopieren
COPY . .

# App builden
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Package files kopieren
COPY package*.json ./

# Nur production dependencies installieren
RUN npm install --only=production

# Built app und server kopieren
COPY --from=build /app/dist ./dist
COPY server.js ./

COPY start-services.sh ./

# Production start script inline erstellen (falls externe Datei fehlt)
RUN echo '#!/bin/bash' > start-services-inline.sh && \
    echo 'set -e' >> start-services-inline.sh && \
    echo '' >> start-services-inline.sh && \
    echo 'echo "[START] Starting AppleJuice WebUI Service..."' >> start-services-inline.sh && \
    echo '' >> start-services-inline.sh && \
    echo '# Main Web Server starten (Port 3000 mit integriertem Proxy)' >> start-services-inline.sh && \
    echo 'echo "[SERVER] Starting Main Web Server on port 3000 (with integrated proxy)..."' >> start-services-inline.sh && \
    echo 'npm start' >> start-services-inline.sh

# Scripts ausführbar machen
RUN chmod +x start-services.sh start-services-inline.sh

# Ports expose
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/status', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Services starten (mit Fallback)
CMD ["sh", "-c", "if [ -f ./start-services.sh ]; then ./start-services.sh; else ./start-services-inline.sh; fi"]
