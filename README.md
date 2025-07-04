# appleJuice WebUI 🍎

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3-brightgreen.svg?style=flat-square)](https://vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg?style=flat-square)](https://nodejs.org/)

**Die moderne WebUI für appleJuice Core** - Eine benutzerfreundliche Weboberfläche für das appleJuice P2P-Netzwerk.

appleJuice Nexus ist eine moderne, responsive Web-Anwendung, die als grafische Benutzeroberfläche für appleJuice Core dient. Sie ermöglicht es Benutzern, ihre appleJuice-Instanz über einen Webbrowser zu verwalten und zu überwachen.

## ✨ Features

- 🎨 **Moderne UI**: Basiert auf Vue 3 und CoreUI für eine benutzerfreundliche Erfahrung
- 📱 **Responsive Design**: Funktioniert auf Desktop, Tablet und Mobilgeräten
- 🔄 **Real-time Updates**: Live-Aktualisierung der Daten
- 🔧 **Konfigurierbar**: Einfache Konfiguration von appleJuice Core Verbindungen
- 🌐 **Multi-Language**: Unterstützung für mehrere Sprachen (geplant)
- 🔒 **Sicher**: Sichere Verbindung zu appleJuice Core
- 🐳 **Docker Support**: Containerisierung für einfache Bereitstellung

## 📋 Inhaltsverzeichnis

* [Voraussetzungen](#voraussetzungen)
* [Installation](#installation)
* [Konfiguration](#konfiguration)
* [Entwicklung](#entwicklung)
* [Production](#production)
* [Docker](#docker)
* [API Endpoints](#api-endpoints)
* [Troubleshooting](#troubleshooting)
* [Mitwirken](#mitwirken)
* [Lizenz](#lizenz)

## 📋 Voraussetzungen

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0 oder **yarn** >= 1.22.0
- **appleJuice Core** (laufende Instanz)

## 🚀 Installation

1. **Repository klonen:**
   ```bash
   git clone https://github.com/your-username/aj-nexus.git
   cd aj-nexus
   ```

2. **Dependencies installieren:**
   ```bash
   npm install
   ```
   oder
   ```bash
   yarn install
   ```

## ⚙️ Konfiguration

### Umgebungsvariablen

Erstellen Sie eine `.env` Datei im Projektverzeichnis:

```env
# appleJuice Core Verbindung
APPLEJUICE_CORE_HOST=192.168.1.100
APPLEJUICE_CORE_PORT=9851

# Server Port
PORT=3000

# Produktionsumgebung
NODE_ENV=development
```

### Standard-Konfiguration

- **Core Host**: `192.168.1.200`
- **Core Port**: `9851`
- **Server Port**: `3000`

## 🛠️ Entwicklung

### Development Server starten

```bash
# Dev Server mit Hot Reload
npm run dev
```

Die Anwendung ist dann unter [http://localhost:3000](http://localhost:3000) erreichbar.

### Build für Production

```bash
# Build für Production
npm run build
```

Die Build-Artefakte werden im `dist/` Verzeichnis gespeichert.

### Linting

```bash
# Code-Qualität überprüfen
npm run lint
```

## 🌐 Production

### Produktionsserver starten

```bash
# Production Server
npm start
```

oder

```bash
# Mit Environment-Variablen
NODE_ENV=production npm start
```

### PM2 (empfohlen für Production)

```bash
# PM2 installieren
npm install -g pm2

# Anwendung starten
pm2 start server.js --name "aj-nexus"

# Status überprüfen
pm2 status

# Logs anzeigen
pm2 logs aj-nexus
```

## 🐳 Docker

### Docker Build

```bash
# Docker Image erstellen
docker build -t aj-nexus .
```

### Docker Run

```bash
# Container starten
docker run -d \
  --name aj-nexus \
  -p 3000:3000 \
  -e APPLEJUICE_CORE_HOST=192.168.1.100 \
  -e APPLEJUICE_CORE_PORT=9851 \
  aj-nexus
```

### Docker Compose

```yaml
version: '3.8'
services:
  aj-nexus:
    build: .
    ports:
      - "3000:3000"
    environment:
      - APPLEJUICE_CORE_HOST=192.168.1.100
      - APPLEJUICE_CORE_PORT=9851
      - NODE_ENV=production
    restart: unless-stopped
```

## 📁 Projektstruktur

```
aj-nexus/
├── public/              # Statische Dateien
├── src/                 # Quellcode
│   ├── assets/          # Bilder, Icons, etc.
│   ├── components/      # Vue-Komponenten
│   ├── layouts/         # Layout-Container
│   ├── router/          # Router-Konfiguration
│   ├── stores/          # Pinia Stores
│   ├── styles/          # SCSS-Styles
│   ├── utils/           # Hilfsfunktionen
│   ├── views/           # Seiten-Komponenten
│   ├── _nav.js          # Sidebar-Navigation
│   ├── App.vue          # Haupt-App-Komponente
│   └── main.js          # Einsprungspunkt
├── server.js            # Express-Server
├── Dockerfile           # Docker-Konfiguration
├── package.json         # Abhängigkeiten
└── vite.config.mjs      # Vite-Konfiguration
```

## 🔌 API Endpoints

### Server-Endpunkte

- **GET** `/status` - Server-Status abfragen
- **GET** `/config` - Aktuelle Konfiguration abrufen
- **POST** `/config` - Konfiguration ändern

### Proxy-Endpunkte

- **GET** `/api/*` - Proxy zu appleJuice Core
- Alle API-Requests werden automatisch an appleJuice Core weitergeleitet

### Beispiel-Requests

```bash
# Server-Status
curl http://localhost:3000/status

# Konfiguration abrufen
curl http://localhost:3000/config

# Konfiguration ändern
curl -X POST http://localhost:3000/config \
  -H "Content-Type: application/json" \
  -d '{"coreHost": "192.168.1.100", "corePort": "9851"}'

# appleJuice Core API (über Proxy)
curl http://localhost:3000/api/info
```

## 🔧 Troubleshooting

### Häufige Probleme

#### Verbindung zu appleJuice Core fehlgeschlagen

```bash
# Prüfen ob appleJuice Core erreichbar ist
curl http://192.168.1.100:9851/

# Firewall-Einstellungen prüfen
# Core-Host und Port in .env korrigieren
```

#### Port bereits in Verwendung

```bash
# Anderen Port verwenden
PORT=3001 npm start

# Oder in .env Datei
echo "PORT=3001" >> .env
```

#### Build-Fehler

```bash
# Node-Modules neu installieren
rm -rf node_modules package-lock.json
npm install

# Cache löschen
npm cache clean --force
```

### Logs

```bash
# Development
npm run dev

# Production
npm start

# Docker
docker logs aj-nexus
```

## 🤝 Mitwirken

Beiträge sind willkommen! Bitte lesen Sie die [Contribution Guidelines](CONTRIBUTING.md) für Details.

### Development Setup

1. Repository forken
2. Feature-Branch erstellen: `git checkout -b feature/amazing-feature`
3. Änderungen committen: `git commit -m 'Add amazing feature'`
4. Branch pushen: `git push origin feature/amazing-feature`
5. Pull Request erstellen

### Code Style

- ESLint-Regeln befolgen
- Prettier für Code-Formatierung
- Vue 3 Composition API verwenden
- TypeScript für neue Features (geplant)

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Siehe [LICENSE](LICENSE) für Details.

## 🙏 Danksagungen

- [CoreUI](https://coreui.io/) für das fantastische Admin-Template
- [Vue.js](https://vuejs.org/) für das reaktive Framework
- [appleJuice Community](https://applejuicenet.de/) für die Unterstützung

---

**appleJuice Nexus** - Moderne Web-UI für das appleJuice P2P-Netzwerk 🍎
