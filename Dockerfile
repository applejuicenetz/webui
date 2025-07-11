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
COPY scripts ./scripts/

# Stellen Sie sicher, dass das Update-Skript ausführbar ist
RUN chmod +x ./scripts/update.sh

# Umgebungsvariablen
ENV DISABLE_AUTO_UPDATE=false
ENV VITE_WEBUI_PORT=3000

# Ports expose
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/status', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Services starten (mit Fallback)
CMD ["npm", "run", "start"]
