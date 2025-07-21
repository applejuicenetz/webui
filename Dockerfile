# Multi-stage build für optimale Image-Größe
FROM node:22-alpine AS builder

# Arbeitsverzeichnis setzen
WORKDIR /app

# Package-Dateien kopieren (für besseres Caching)
COPY package*.json ./

# Dependencies installieren (inkl. devDependencies für Build)
# Optimierungen: --prefer-offline, --no-audit, --no-fund für schnellere Installation
RUN npm ci --silent --prefer-offline --no-audit --no-fund

# Quellcode kopieren
COPY . .

# Build mit optimierten Einstellungen
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Production Stage
FROM node:22-alpine AS production

# Arbeitsverzeichnis setzen
WORKDIR /app

# Nur production dependencies installieren
COPY package*.json ./
RUN npm ci --only=production --silent && npm cache clean --force

# Gebaute Anwendung und Server-Dateien kopieren
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./
COPY --from=builder /app/.env.example ./.env.example

# Non-root User erstellen für Sicherheit
RUN addgroup -g 1001 -S nodejs && \
    adduser -S applejuice -u 1001

# Ownership ändern
RUN chown -R applejuice:nodejs /app
USER applejuice

# Umgebungsvariablen
ENV DISABLE_AUTO_UPDATE=false
ENV VITE_AJ_CORE_HOST=http://localhost
ENV VITE_AJ_CORE_PORT=9851


# Port freigeben
EXPOSE 3000

# Health check hinzufügen
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Anwendung starten
CMD ["npm", "run", "start"]