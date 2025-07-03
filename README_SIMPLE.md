# AppleJuice Nexus - Einfache Lösung

## ✅ Eine Lösung für alles

- **Funktioniert unter Docker** 🐳
- **Funktioniert beim Self-Hosting** 🏠
- **Keine extra Installation nötig** 🚀
- **Keine CORS-Probleme** ✨

## Wie es funktioniert

Ein **Express-Server** macht alles:
1. Liefert die Vue.js App aus
2. Fungiert als API-Proxy
3. Löst alle CORS-Probleme
4. Läuft überall gleich

## Schnellstart

### 1. Dependencies installieren
```bash
npm install
```

### 2. Für Entwicklung
```bash
# Frontend entwickeln (mit Vite)
npm run dev

# Backend testen
npm run serve
```

### 3. Für Produktion
```bash
# App bauen
npm run build

# Production server starten
npm start
```

### 4. Mit Docker
```bash
# Mit Docker Compose
docker-compose up -d

# Oder manuell
docker build -t aj-nexus .
docker run -p 3000:3000 -e APPLEJUICE_CORE_HOST=192.168.178.222 aj-nexus
```

## Konfiguration

### Environment Variables
```bash
# AppleJuice Core Settings
APPLEJUICE_CORE_HOST=192.168.178.222
APPLEJUICE_CORE_PORT=9854

# Server Port
PORT=3000
```

### Zur Laufzeit konfigurieren
```bash
# Aktuelle Konfiguration abrufen
curl http://localhost:3000/config

# Konfiguration ändern
curl -X POST http://localhost:3000/config \
  -H "Content-Type: application/json" \
  -d '{"coreHost": "192.168.1.100", "corePort": "9854"}'
```

## Ports

- **App**: http://localhost:3000
- **API**: http://localhost:3000/api/*
- **Status**: http://localhost:3000/status
- **Config**: http://localhost:3000/config

## Architektur

```
Browser → Express Server (Port 3000)
         ├── / (Vue.js App)
         ├── /api/* (Proxy → AppleJuice Core)
         ├── /status (Server Status)
         └── /config (Configuration)
```

## Vorteile

✅ **Einfach**: Ein Server macht alles  
✅ **Universell**: Funktioniert überall gleich  
✅ **Keine CORS-Probleme**: Gleiche Origin  
✅ **Flexibel**: Konfigurierbar zur Laufzeit  
✅ **Docker-ready**: Dockerfile included  
✅ **Self-hosting ready**: Einfach `npm start`  

## Troubleshooting

### Server startet nicht
```bash
# Port bereits belegt?
netstat -an | grep 3000

# Andere Port verwenden
PORT=3001 npm start
```

### Kann nicht mit Core verbinden
```bash
# Konfiguration prüfen
curl http://localhost:3000/config

# Konfiguration ändern
curl -X POST http://localhost:3000/config \
  -H "Content-Type: application/json" \
  -d '{"coreHost": "DEINE_CORE_IP"}'
```

### Docker Build Fehler
```bash
# Clean build
docker build --no-cache -t aj-nexus .

# Logs prüfen
docker logs aj-nexus
```

Das ist die einfachste Lösung für beide Szenarien! 🎉