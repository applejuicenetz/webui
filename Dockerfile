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
COPY simple-proxy-cjs.js ./
COPY start-services.sh ./

# Production start script inline erstellen (falls externe Datei fehlt)
RUN echo '#!/bin/bash' > start-services-inline.sh && \
    echo 'set -e' >> start-services-inline.sh && \
    echo '' >> start-services-inline.sh && \
    echo 'echo "🚀 Starting AppleJuice WebUI Services..."' >> start-services-inline.sh && \
    echo '' >> start-services-inline.sh && \
    echo '# Proxy Server starten (Port 3001)' >> start-services-inline.sh && \
    echo 'echo "📡 Starting Proxy Server on port 3001..."' >> start-services-inline.sh && \
    echo 'node simple-proxy-cjs.js &' >> start-services-inline.sh && \
    echo 'PROXY_PID=$!' >> start-services-inline.sh && \
    echo '' >> start-services-inline.sh && \
    echo '# Warten bis Proxy bereit ist' >> start-services-inline.sh && \
    echo 'sleep 2' >> start-services-inline.sh && \
    echo '' >> start-services-inline.sh && \
    echo '# Main Web Server starten (Port 3000)' >> start-services-inline.sh && \
    echo 'echo "🌐 Starting Main Web Server on port 3000..."' >> start-services-inline.sh && \
    echo 'npm start &' >> start-services-inline.sh && \
    echo 'MAIN_PID=$!' >> start-services-inline.sh && \
    echo '' >> start-services-inline.sh && \
    echo '# Funktion für graceful shutdown' >> start-services-inline.sh && \
    echo 'cleanup() {' >> start-services-inline.sh && \
    echo '  echo "🛑 Shutting down services..."' >> start-services-inline.sh && \
    echo '  kill $PROXY_PID $MAIN_PID' >> start-services-inline.sh && \
    echo '  exit 0' >> start-services-inline.sh && \
    echo '}' >> start-services-inline.sh && \
    echo '' >> start-services-inline.sh && \
    echo '# Signal handlers' >> start-services-inline.sh && \
    echo 'trap cleanup SIGINT SIGTERM' >> start-services-inline.sh && \
    echo '' >> start-services-inline.sh && \
    echo '# Warten auf beide Prozesse' >> start-services-inline.sh && \
    echo 'wait $PROXY_PID $MAIN_PID' >> start-services-inline.sh

# Scripts ausführbar machen
RUN chmod +x start-services.sh start-services-inline.sh

# Ports expose
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/status', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Services starten (mit Fallback)
CMD ["sh", "-c", "if [ -f ./start-services.sh ]; then ./start-services.sh; else ./start-services-inline.sh; fi"]
