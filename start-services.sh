#!/bin/sh

# AppleJuice WebUI Services Starter

echo "🚀 Starting AppleJuice WebUI Services..."

# Proxy Server starten (Port 3001)
echo "📡 Starting Proxy Server on port 3001..."
node simple-proxy-cjs.js &
PROXY_PID=$!

# Warten bis Proxy bereit ist
sleep 2

# Main Web Server starten (Port 3000)
echo "🌐 Starting Main Web Server on port 3000..."
npm start &
MAIN_PID=$!

# Funktion für graceful shutdown
cleanup() {
  echo "🛑 Shutting down services..."
  kill $PROXY_PID $MAIN_PID
  exit 0
}

# Signal handlers
trap cleanup SIGINT SIGTERM

# Warten auf beide Prozesse
wait $PROXY_PID $MAIN_PID
