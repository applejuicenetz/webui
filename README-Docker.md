# 🐳 AppleJuice WebUI - Docker

Eine containerisierte Version der AppleJuice WebUI für einfache Bereitstellung.

## 🚀 Schnellstart

```bash
# Mit Docker Compose
docker-compose up -d

# Manuell
docker build -t applejuice-webui .
docker run -d -p 3000:3000 applejuice-webui
```

WebUI ist verfügbar unter: `http://localhost:3000`

## ⚙️ Konfiguration

### Wichtige Umgebungsvariablen

| Variable | Beschreibung | Standard |
|----------|--------------|----------|
| `VITE_CORE_HOST` | AppleJuice Core Server IP | `localhost` |
| `VITE_CORE_PORT` | AppleJuice Core Server Port | `9851` |
| `SESSION_SECRET` | Sicherer Session-Schlüssel | `applejuice-secret-key...` |
| `PORT` | WebUI Port | `3000` |

### docker-compose.yml anpassen

```yaml
environment:
  - VITE_CORE_HOST=192.168.1.100  # Ihre Core Server IP
  - VITE_CORE_PORT=9851
  - SESSION_SECRET=ihr-sicherer-schlüssel
```

## 🔧 Verwaltung

```bash
# Status prüfen
docker-compose ps

# Logs anzeigen
docker-compose logs -f

# Neu starten
docker-compose restart

# Stoppen
docker-compose down
```

## 🛡️ Sicherheit

- Ändern Sie `SESSION_SECRET` in Produktionsumgebung
- Verwenden Sie HTTPS über Reverse Proxy
- Beschränken Sie Netzwerkzugriff auf notwendige Ports

## 📊 Health Check

```bash
curl http://localhost:3000/api/health
```