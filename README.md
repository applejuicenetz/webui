# 🍎 appleJuice WebUI

Eine moderne, responsive Web-Anwendung mit Vue 3, TypeScript, Bootstrap 5 und Pinia für State Management.

## ✨ Features

- 🔐 **Sichere Authentifizierung** 
- 📊 **Dashboard** - Übersichtliches Dashboard mit Statistiken
- 🎨 **Modernes Design** - Bootstrap 5 mit gradientem Farbschema
- 📱 **Responsive** - Optimiert für alle Bildschirmgrößen
- 🔔 **Benachrichtigungen** - Elegant mit SweetAlert2
- 🗂️ **State Management** - Mit Pinia für bessere Datenverwaltung
- 🌍 **Deutsche Lokalisation** - Vollständig auf Deutsch
- 🎯 **FontAwesome Icons** - Moderne Icon-Bibliothek integriert
- 📐 **Optimierte Layouts** - Verbesserte Seitenverhältnisse für bessere UX


## 🏗️ Technologie-Stack

### Frontend
- **Vue 3** - Progressive JavaScript Framework
- **TypeScript** - Typisiertes JavaScript
- **Bootstrap 5.3.7** - CSS Framework
- **Font Awesome 6** - Icons

### State Management & Routing
- **Pinia 3.0.3** - Vue Store
- **Vue Router 4** - Routing
- **SweetAlert2** - Benachrichtigungen

### Build Tools
- **Vite** - Build Tool
- **vue-tsc** - TypeScript Checker

## 📁 Projektstruktur

```
src/
├── components/          # Wiederverwendbare Komponenten
├── views/              # Seiten/Views
│   ├── LoginView.vue   # Login-Seite
│   ├── DashboardView.vue # Dashboard
│   └── DownloadView.vue  # Download-Seite
├── stores/             # Pinia Stores
│   └── auth.ts         # Authentifizierung Store
├── router/             # Vue Router Konfiguration
├── assets/             # Statische Assets
└── main.ts             # Haupteinstiegspunkt
```

## 🎨 Design System

### Komponenten
- Alle Komponenten nutzen Bootstrap 5 Klassen
- Custom CSS für Animationen
- Responsive Design mit Bootstrap Grid

## 🛡️ Sicherheit

- **Router Guards** - Schutz geschützter Routen
- **State Persistence** - Authentifizierungsstatus wird verwaltet
- **Demo-Modus** - Sichere Demo-Implementierung ohne echte Backend-Verbindung

## 📱 Responsive Breakpoints

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

## 🔄 Workflow

1. **Login**
2. **Redirect** - Automatische Weiterleitung zum Dashboard
3. **Navigation** - Zugriff auf verschiedene Bereiche über Sidebar
4. **Logout** - Sichere Abmeldung mit Bestätigung

## 🤝 Entwicklung

### Code Style
- TypeScript für bessere Typsicherheit
- Vue 3 Composition API
- ESLint für Code-Qualität

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz.

---

**appleJuice WebUI** - Moderne Web-Anwendung mit Vue 3 💚
