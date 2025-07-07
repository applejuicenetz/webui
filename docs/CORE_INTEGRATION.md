# AppleJuice Core Integration - Echtzeit XML-zu-JSON

Diese Dokumentation beschreibt die Implementierung der Echtzeit-Datenverarbeitung für die AppleJuice Core Integration.

## Überblick

Die Implementierung wandelt XML-Daten vom AppleJuice Core in Echtzeit in JSON um und stellt sie dem Frontend zur Verfügung. Die Aktualisierung erfolgt automatisch alle 5 Sekunden.

## Architektur

### 1. Core Service (`src/services/coreService.js`)

Der Core Service ist die zentrale Schnittstelle für die Kommunikation mit dem AppleJuice Core:

- **XML-zu-JSON-Konvertierung**: Wandelt XML-Responses in strukturierte JSON-Objekte um
- **Datenextraktion**: Extrahiert spezifische Informationen aus den XML-Strukturen
- **Automatische Updates**: Verwaltet Timer für Echtzeit-Aktualisierungen
- **Fehlerbehandlung**: Robuste Fehlerbehandlung mit Retry-Mechanismus
- **Caching**: Zwischenspeicherung für Offline-Verfügbarkeit

#### Hauptfunktionen:
```javascript
// Core-Kommando ausführen
await coreService.command('xml', 'information.xml')

// Alle Core-Daten abrufen
await coreService.getAllCoreData()

// Auto-Update starten (5 Sekunden)
coreService.startAutoUpdate(5000)
```

### 2. XML Parser (`src/utils/xmlParser.js`)

Erweiterte XML-Parsing-Utilities für bessere Kompatibilität mit AppleJuice Core:

- **Bereinigung**: Entfernt ungültige Zeichen und normalisiert XML
- **Rekursive Konvertierung**: Wandelt XML-Strukturen in JSON-Objekte um
- **Datenextraktion**: Sichere Extraktion von Werten aus komplexen Strukturen
- **Validierung**: Prüft XML-Gültigkeit und AppleJuice-Kompatibilität

#### Spezialisierte Parser:
```javascript
// Für verschiedene XML-Typen
AJXmlParser.parseInformation(xmlString)
AJXmlParser.parseDownloads(xmlString)
AJXmlParser.parseUploads(xmlString)
AJXmlParser.parseShared(xmlString)
AJXmlParser.parseServer(xmlString)
AJXmlParser.parseNetwork(xmlString)
```

### 3. Core Store (`src/stores/core.js`)

Pinia-Store für State Management der Core-Daten:

- **Reactive State**: Vue 3 Composition API mit Pinia
- **Computed Properties**: Berechnete Eigenschaften für UI-Anzeige
- **Actions**: Asynchrone Aktionen für Datenabruf
- **Getters**: Formatierte Daten für die Anzeige

#### State-Struktur:
```javascript
{
  coreData: {
    server: { name, ip, description },
    statistics: { downloads, uploads, shares, credits },
    coreInfo: { version, os, uptime, connections, bytesIn, bytesOut },
    networkInfo: { download, upload, sharedUsers, totalFiles, totalSize }
  },
  isLoading: false,
  isConnected: false,
  lastUpdate: null,
  autoUpdateEnabled: false
}
```

### 4. Dashboard Integration (`src/views/Dashboard.vue`)

Das Dashboard wurde für Echtzeit-Updates erweitert:

- **Live-Daten**: Zeigt aktuelle Core-Daten in Echtzeit an
- **Verbindungsstatus**: Visueller Status der Core-Verbindung
- **Fehlerbehandlung**: Benutzerfreundliche Fehleranzeige
- **Loading States**: Lade-Indikatoren während Updates

#### Features:
- Automatische Aktualisierung alle 5 Sekunden
- Manueller Refresh-Button
- Verbindungsstatus-Badges
- Offline-Fallback auf gecachte Daten

### 5. Core Test Page (`src/views/CoreTest.vue`)

Debug-Seite für Tests und Entwicklung:

- **Verbindungstest**: Testet die Core-Verbindung
- **Endpoint-Tests**: Testet alle XML-Endpoints einzeln
- **Live-Updates**: Zeigt Live-Daten mit Start/Stop-Funktionalität
- **Raw-Daten**: Zeigt XML, JSON und extrahierte Daten

## XML-Endpoints

Die folgenden AppleJuice Core XML-Endpoints werden unterstützt:

| Endpoint | Beschreibung | Daten |
|----------|-------------|--------|
| `information.xml` | Core-Informationen | Version, OS, Uptime, Verbindungen |
| `downloads.xml` | Download-Liste | Aktive/Geplante Downloads |
| `uploads.xml` | Upload-Liste | Aktive Uploads |
| `shared.xml` | Geteilte Dateien | Shares, Größe, Anzahl |
| `server.xml` | Server-Konfiguration | IP, Einstellungen |
| `network.xml` | Netzwerk-Status | Download/Upload-Speed, Users |

## Datenfluss

```
AppleJuice Core (XML) 
    ↓
Proxy Server (Raw TCP)
    ↓
Core Service (XML → JSON)
    ↓
Core Store (State Management)
    ↓
Dashboard (UI Components)
```

## Verwendung

### 1. Dashboard nutzen

Nach dem Login wird automatisch das Dashboard geladen:
- Daten werden automatisch alle 5 Sekunden aktualisiert
- Verbindungsstatus wird in der Kopfzeile angezeigt
- Manueller Refresh über den Button möglich

### 2. Core Test nutzen

Für Entwicklung und Debugging:
1. Navigation zu "Core Test" (Debug-Sektion)
2. "Test Verbindung" für einzelne Tests
3. "Alle Daten laden" für vollständige Tests
4. Live-Updates für Echtzeit-Monitoring

### 3. Programmatische Nutzung

```javascript
// In Vue-Komponenten
import { useCoreStore } from '@/stores/core'

const coreStore = useCoreStore()

// Daten laden
await coreStore.loadCoreData()

// Auto-Update starten
coreStore.startAutoUpdate(5000)

// Auf Daten zugreifen
const serverInfo = coreStore.coreData.server
```

## Fehlerbehandlung

### Verbindungsfehler
- Automatische Retry-Mechanismen
- Fallback auf gecachte Daten
- Benutzerfreundliche Fehlermeldungen

### XML-Parser-Fehler
- Robuste XML-Bereinigung
- Validierung vor Parsing
- Fallback auf Raw-Daten

### Authentifizierung
- Automatische Weiterleitung bei ungültigen Credentials
- Session-Management über Auth-Store

## Konfiguration

### Umgebungsvariablen
```env
VITE_AJ_CORE_HOST=192.168.1.100
VITE_AJ_CORE_PORT=9851
VITE_AJ_CORE_PROTOCOL=http
VITE_AJ_CONNECTION_TIMEOUT=10000
```

### Update-Intervall
```javascript
// Im Dashboard oder per Code
coreStore.startAutoUpdate(5000) // 5 Sekunden
```

## Performance

### Optimierungen
- Lazy Loading der Komponenten
- Effiziente XML-Parsing-Algorithmen
- Caching für Offline-Verfügbarkeit
- Debouncing für häufige Updates

### Monitoring
- Console-Logging für Debugging
- Performance-Metriken in der Test-Seite
- Verbindungsstatistiken

## Erweiterte Features

### Offline-Unterstützung
- Automatisches Caching der letzten Daten
- Fallback-Anzeige bei Verbindungsproblemen
- Wiederherstellung bei Reconnect

### Adaptive Updates
- Verlangsamung bei Fehlern
- Stopp bei wiederholten Authentifizierungsfehlern
- Anpassung an Netzwerkbedingungen

### Datenvalidierung
- XML-Struktur-Validierung
- Konsistenz-Checks
- Fehlerhafte Daten-Filterung

## Bekannte Limitierungen

1. **TCP-Proxy notwendig**: AppleJuice Core sendet teilweise malformed HTTP-Responses
2. **Polling-basiert**: Keine WebSocket-Unterstützung im Core
3. **Authentifizierung**: Passwort-basierte Authentifizierung pro Request
4. **XML-Variationen**: Verschiedene Core-Versionen können unterschiedliche XML-Strukturen haben

## Troubleshooting

### Verbindungsprobleme
1. Core-Host und Port prüfen
2. Proxy-Server-Logs checken
3. Firewall-Einstellungen überprüfen

### XML-Parser-Fehler
1. Raw-XML in der Test-Seite prüfen
2. XML-Validierung durchführen
3. Core-Version auf Kompatibilität prüfen

### Performance-Probleme
1. Update-Intervall erhöhen
2. Caching-Strategien anpassen
3. Netzwerk-Latenz messen

## Weiterentwicklung

### Geplante Features
- WebSocket-Unterstützung (falls Core erweitert wird)
- Erweiterte Caching-Strategien
- Daten-Kompression
- Batch-Updates

### Erweiterungsmöglichkeiten
- Zusätzliche XML-Endpoints
- Erweiterte Datenvisualisierung
- Export-Funktionen
- Historische Daten-Speicherung
