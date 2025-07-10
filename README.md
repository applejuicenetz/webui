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
* [Konfiguration](#konfiguration)
* [API Endpoints](#api-endpoints)
* [Mitwirken](#mitwirken)
* [Lizenz](#lizenz)

## 📋 Voraussetzungen

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0 oder **yarn** >= 1.22.0
- **appleJuice Core** (laufende Instanz)

### Standard-Konfiguration

- **Core Host**: `192.168.1.200`
- **Core Port**: `9851`
- **Server Port**: `3000`

## 📁 Projektstruktur

```
aj-webui/
├── public/              # Statische Dateien
├── scripts/             # App bezogene Scripte
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

### Proxy-Endpunkte

- **GET** `/api/*` - Proxy zu appleJuice Core
- Alle API-Requests werden automatisch an appleJuice Core weitergeleitet

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

**appleJuice WebUi** - Moderne Web-UI für das appleJuice P2P-Netzwerk 🍎
