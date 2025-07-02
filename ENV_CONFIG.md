# Umgebungsvariablen Konfiguration

Diese Datei erklärt die verfügbaren Umgebungsvariablen für AppleJuice neXus.

## Setup

1. Kopieren Sie `.env.example` zu `.env`:
   ```bash
   cp .env.example .env
   ```

2. Passen Sie die Werte in der `.env` Datei an Ihre AppleJuice Core-Installation an.

## Verfügbare Variablen

### Core-Verbindung

| Variable | Beschreibung | Standardwert | Beispiel |
|----------|--------------|--------------|----------|
| `VITE_AJ_CORE_HOST` | IP-Adresse oder Hostname des AppleJuice Core | `localhost` | `192.168.178.222` |
| `VITE_AJ_CORE_PORT` | Port des AppleJuice Core | `9851` | `9854` |
| `VITE_AJ_CORE_PROTOCOL` | Protokoll für die Verbindung | `http` | `https` |
| `VITE_AJ_CONNECTION_TIMEOUT` | Timeout für Verbindungen (in ms) | `10000` | `15000` |

## Beispiel .env Datei

```env
# AppleJuice Core Configuration
VITE_AJ_CORE_HOST=192.168.178.222
VITE_AJ_CORE_PORT=9854
VITE_AJ_CORE_PROTOCOL=http
VITE_AJ_CONNECTION_TIMEOUT=10000
```

## Wichtige Hinweise

- **Vite Prefix**: Alle Umgebungsvariablen müssen mit `VITE_` beginnen, um im Frontend verfügbar zu sein
- **Git**: Die `.env` Datei wird automatisch von Git ignoriert (siehe `.gitignore`)
- **Typen**: Numerische Werte werden automatisch zu Zahlen konvertiert
- **Fallback**: Wenn eine Variable nicht gesetzt ist, wird der Standardwert verwendet

## Verwendung im Code

Die Umgebungsvariablen werden über das zentrale Config-System verfügbar gemacht:

```javascript
import { config } from '@/utils/config'

// Zugriff auf Core-Konfiguration
console.log(config.core.host)     // VITE_AJ_CORE_HOST
console.log(config.core.port)     // VITE_AJ_CORE_PORT
console.log(config.core.timeout)  // VITE_AJ_CONNECTION_TIMEOUT
```

## Entwicklung vs. Produktion

### Entwicklung
- Verwenden Sie `.env` für lokale Entwicklungseinstellungen
- Diese Datei wird nicht ins Repository übertragen

### Produktion
- Setzen Sie Umgebungsvariablen über Ihr Deployment-System
- Docker: Verwenden Sie `docker-compose.yml` oder `--env-file`
- Server: Setzen Sie die Variablen in der Shell oder über systemd

## Troubleshooting

### Variable wird nicht geladen
1. Stellen Sie sicher, dass die Variable mit `VITE_` beginnt
2. Überprüfen Sie die Syntax in der `.env` Datei (keine Leerzeichen um `=`)
3. Starten Sie den Entwicklungsserver neu nach Änderungen

### Standardwerte werden verwendet
1. Überprüfen Sie die Schreibweise der Variablennamen
2. Stellen Sie sicher, dass die `.env` Datei im Root-Verzeichnis liegt
3. Prüfen Sie die Browser-Konsole auf Fehlermeldungen