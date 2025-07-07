#!/bin/bash

# AppleJuice WebUI Service Starter

echo "[START] Starting AppleJuice WebUI Service..."

# Main Web Server starten (Port 3000 mit integriertem Proxy)
echo "[SERVER] Starting Main Web Server on port 3000 (with integrated proxy)..."
npm start
