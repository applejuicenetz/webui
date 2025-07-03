@echo off
echo AppleJuice Nexus - Einfache Installation
echo ========================================
echo.

echo 1. Dependencies installieren...
npm install

if %errorlevel% neq 0 (
    echo FEHLER: Dependencies konnten nicht installiert werden
    pause
    exit /b 1
)

echo.
echo 2. App bauen...
npm run build

if %errorlevel% neq 0 (
    echo FEHLER: App konnte nicht gebaut werden
    pause
    exit /b 1
)

echo.
echo 3. Production Server starten...
echo.
echo   Server läuft auf: http://localhost:3000
echo   Status: http://localhost:3000/status
echo   API: http://localhost:3000/api/*
echo.
echo Zum Stoppen: Strg+C drücken
echo.

npm start
