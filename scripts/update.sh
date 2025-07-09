#!/bin/bash

# Update-Skript für AppleJuice WebUI
# Dieses Skript lädt die neueste Version von GitHub herunter und aktualisiert die Installation

# Logging-Funktion
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Fehlerbehandlung
set -e
trap 'log "Fehler beim Update-Prozess. Abbruch."; exit 1' ERR

# Arbeitsverzeichnis
WORK_DIR="/tmp/aj-webui-update"
INSTALL_DIR="$(pwd)"

log "Update-Prozess gestartet"
log "Installationsverzeichnis: $INSTALL_DIR"

# Temporäres Verzeichnis erstellen und bereinigen
rm -rf "$WORK_DIR" 2>/dev/null || true
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

log "Neueste Version von GitHub herunterladen"
# Neueste Release-URL abrufen
LATEST_RELEASE_URL=$(curl -s https://api.github.com/repos/applejuicenetz/webui/releases/latest | grep "tarball_url" | cut -d '"' -f 4)

if [ -z "$LATEST_RELEASE_URL" ]; then
  log "Fehler: Konnte die neueste Version nicht ermitteln"
  exit 1
fi

log "Neueste Version gefunden: $LATEST_RELEASE_URL"

# Release herunterladen
log "Herunterladen der neuesten Version..."
curl -L -o latest.tar.gz "$LATEST_RELEASE_URL"

# Entpacken
log "Entpacken des Archivs..."
mkdir -p extract
tar -xzf latest.tar.gz -C extract --strip-components=1

# In das Extraktionsverzeichnis wechseln
cd extract

# Backup der aktuellen Konfiguration
log "Backup der aktuellen Konfiguration..."
if [ -f "$INSTALL_DIR/.env" ]; then
  cp "$INSTALL_DIR/.env" ./
fi

# Build der neuen Version
log "Installieren von Abhängigkeiten und Build der neuen Version..."
npm install
npm run build

# Aktualisieren der Installation
log "Aktualisieren der Installation..."
cp -r dist/* "$INSTALL_DIR/dist/"
cp package.json "$INSTALL_DIR/"
cp server.js "$INSTALL_DIR/"

# Aufräumen
log "Aufräumen..."
cd "$INSTALL_DIR"
rm -rf "$WORK_DIR"

log "Update erfolgreich abgeschlossen"
log "Der Server wird in Kürze neu gestartet"

exit 0
