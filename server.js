const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const http = require('http');
const net = require('net');

const app = express();
const PORT = process.env.PORT || 3000;

// Default AppleJuice Core settings
let CORE_HOST = process.env.VITE_AJ_CORE_HOST || process.env.APPLEJUICE_CORE_HOST || '192.168.178.222';
let CORE_PORT = process.env.VITE_AJ_CORE_PORT || process.env.APPLEJUICE_CORE_PORT || '9854';

console.log(`[START] Starting appleJuice WebUi Server on port ${PORT}`);
console.log(`[PROXY] Proxying API requests to: http://${CORE_HOST}:${CORE_PORT}`);

// Middleware für JSON parsing
app.use(express.json());

// Dynamic proxy function
function createDynamicProxy() {
  return createProxyMiddleware({
    target: `http://${CORE_HOST}:${CORE_PORT}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api': '', // /api/xml/settings.xml wird zu /xml/settings.xml, /api/function/... wird zu /function/...
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[PROXY] ${req.method} ${req.url} -> http://${CORE_HOST}:${CORE_PORT}${req.url.replace('/api', '')}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      // CORS Headers hinzufügen
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';

      console.log(`[OK] Response: ${proxyRes.statusCode} for ${req.url}`);
    },
    onError: (err, req, res) => {
      console.error(`[ERROR] Proxy Error: ${err.message}`);
      res.status(500).json({
        error: 'Proxy Error',
        message: 'Kann nicht mit AppleJuice Core verbinden',
        details: err.message
      });
    }
  });
}

// Custom proxy handler for AppleJuice Core (handles malformed HTTP responses)
app.use('/api', (req, res, next) => {
  const targetPath = req.url; // req.url is already stripped of /api by Express

  console.log(`[TCP-PROXY] ${req.method} /api${req.url} -> ${CORE_HOST}:${CORE_PORT}${targetPath}`);

  // Use raw TCP connection to handle malformed HTTP responses
  const client = new net.Socket();
  let responseData = '';

  client.connect(CORE_PORT, CORE_HOST, () => {
    // Send raw HTTP request
    const httpRequest = `${req.method} ${targetPath} HTTP/1.1\r\nHost: ${CORE_HOST}:${CORE_PORT}\r\nConnection: close\r\n\r\n`;
    client.write(httpRequest);
  });

  client.on('data', (data) => {
    responseData += data.toString();
  });

  client.on('close', () => {
    try {
      // Parse the raw HTTP response
      const lines = responseData.split('\n');
      const statusLine = lines[0].trim();
      const statusMatch = statusLine.match(/HTTP\/1\.1 (\d+)/);
      const statusCode = statusMatch ? parseInt(statusMatch[1]) : 500;

      console.log(`[OK] Raw Response: ${statusCode} for ${req.url}`);

      // Spezielle Behandlung für 302-Redirects
      if (statusCode === 302) {
        const locationMatch = responseData.match(/Location: (.+)/i);
        const location = locationMatch ? locationMatch[1].trim() : 'unknown';
        console.error(`[PROXY] 302 Redirect detected: ${req.url} -> ${location}`);
        console.error(`[PROXY] Full response:`, responseData.substring(0, 500));

        // Prüfe ob es ein Authentifizierungsproblem ist
        if (location.includes('login') || location.includes('auth')) {
          console.error(`[PROXY] Authentication issue detected!`);
        }
      }

      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      // Find the start of the body (after empty line)
      let bodyStart = responseData.indexOf('\n\n');
      if (bodyStart === -1) {
        bodyStart = responseData.indexOf('\r\n\r\n');
      }

      if (bodyStart !== -1) {
        const body = responseData.substring(bodyStart + 2).trim();

        // Check if it's XML
        if (body.includes('<?xml') || body.includes('<settings')) {
          res.setHeader('Content-Type', 'application/xml');
          res.status(statusCode).send(body);
        } else {
          res.status(statusCode).send(body);
        }
      } else {
        res.status(statusCode).send('');
      }
    } catch (error) {
      console.error(`[ERROR] Response parsing error: ${error.message}`);
      res.status(500).json({
        error: 'Response parsing error',
        message: 'Fehler beim Parsen der AppleJuice Core Antwort',
        details: error.message
      });
    }
  });

  client.on('error', (err) => {
    console.error(`[ERROR] TCP Proxy Error: ${err.message}`);
    res.status(500).json({
      error: 'Connection Error',
      message: 'Kann nicht mit AppleJuice Core verbinden',
      details: err.message
    });
  });

  client.setTimeout(10000, () => {
    console.error('[ERROR] TCP Proxy Timeout');
    client.destroy();
    res.status(504).json({
      error: 'Timeout',
      message: 'AppleJuice Core antwortet nicht'
    });
  });
});

// Special proxy handler for XML endpoints (alternative approach)
app.use('/proxy', (req, res) => {
  console.log(`[PROXY-REQ] ${req.method} ${req.url}`);

  // CORS Preflight Request
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Cache-Control',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  // Nur GET-Requests weiterleiten
  if (req.method !== 'GET') {
    res.writeHead(405, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*'
    });
    res.end('Method Not Allowed');
    return;
  }

  // URL parsen - /proxy/api/... -> /xml/...
  const targetPath = req.url.replace('/proxy/api/', '/xml/');
  console.log(`[PROXY] ${req.url} -> http://${CORE_HOST}:${CORE_PORT}${targetPath}`);

  // Raw TCP-Socket verwenden (umgeht HTTP-Parser)
  const socket = net.createConnection(CORE_PORT, CORE_HOST, () => {
    console.log(`[CONNECT] Connected to ${CORE_HOST}:${CORE_PORT}`);

    // HTTP-Request manuell senden (HTTP/1.0 für bessere Kompatibilität)
    const httpRequest = [
      `GET ${targetPath} HTTP/1.0`,
      `Host: ${CORE_HOST}`,
      `User-Agent: Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)`,
      `Accept: */*`,
      `Connection: close`,
      ``,
      ``
    ].join('\r\n');

    console.log(`[SEND] Sending HTTP request:`, httpRequest.replace(/\r\n/g, '\\r\\n'));
    socket.write(httpRequest);
  });

  let rawResponse = '';
  let headersParsed = false;
  let statusCode = 200;
  let body = '';

  socket.on('data', (chunk) => {
    console.log(`[DATA] Received chunk: ${chunk.length} bytes`);
    rawResponse += chunk.toString();

    if (!headersParsed) {
      const headerEndIndex = rawResponse.indexOf('\r\n\r\n');
      if (headerEndIndex !== -1) {
        headersParsed = true;
        const headerSection = rawResponse.substring(0, headerEndIndex);
        body = rawResponse.substring(headerEndIndex + 4);

        console.log(`[HEADERS] Raw Headers:`, headerSection);

        // Status-Code extrahieren
        const statusMatch = headerSection.match(/HTTP\/1\.[01] (\d+)/);
        if (statusMatch) {
          statusCode = parseInt(statusMatch[1]);
        }

        // Sichere Headers setzen mit CORS
        const safeHeaders = {
          'Content-Type': 'application/xml; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Cache-Control',
          'Access-Control-Allow-Credentials': 'false',
          'Cache-Control': 'no-cache'
        };

        console.log(`[RESPONSE] Status: ${statusCode}`);
        res.writeHead(statusCode, safeHeaders);

        // Body sofort senden falls vorhanden
        if (body) {
          console.log(`[BODY] Initial body part: ${body.length} chars`);
          res.write(body);
        }
      } else {
        // Noch keine kompletten Headers
        console.log(`[PARTIAL] Partial response: ${rawResponse.length} chars`);
        if (rawResponse.length > 0) {
          console.log(`[PARTIAL] Raw response so far: ${rawResponse.substring(0, 100)}...`);
        }
      }
    } else {
      // Weitere Body-Daten
      body += chunk.toString();
      console.log(`[BODY] Additional body: ${chunk.length} chars`);
      res.write(chunk);
    }
  });

  socket.on('end', () => {
    console.log(`[OK] Connection ended`);
    console.log(`[BODY] Total body length: ${body.length}`);

    if (body.length > 0) {
      console.log(`[BODY] Body preview: ${body.substring(0, 200)}...`);
    }

    res.end();
  });

  socket.on('error', (err) => {
    console.error('[ERROR] Socket error:', err.message);
    if (!res.headersSent) {
      res.writeHead(500, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      });
      res.end('Socket Error: ' + err.message);
    }
  });

  // Request timeout
  socket.setTimeout(10000, () => {
    console.error('[ERROR] Request timeout');
    socket.destroy();
    if (!res.headersSent) {
      res.writeHead(504, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      });
      res.end('Request Timeout');
    }
  });
});

// Statische Dateien ausliefern (Production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));

  // Alle anderen Routen zur index.html weiterleiten (SPA)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // Development Info
  app.get('/', (req, res) => {
    res.json({
      message: 'AppleJuice WebUI API Server',
      mode: 'development',
      proxy: `http://${CORE_HOST}:${CORE_PORT}`,
      endpoints: {
        api: '/api/*',
        status: '/status'
      }
    });
  });
}

// Configuration endpoints
app.get('/config', (req, res) => {
  res.json({
    coreHost: CORE_HOST,
    corePort: CORE_PORT,
    serverPort: PORT
  });
});

app.post('/config', (req, res) => {
  const { coreHost, corePort } = req.body;

  if (coreHost) {
    CORE_HOST = coreHost;
    console.log(`[CONFIG] Core Host updated to: ${CORE_HOST}`);
  }

  if (corePort) {
    CORE_PORT = corePort;
    console.log(`[CONFIG] Core Port updated to: ${CORE_PORT}`);
  }

  res.json({
    message: 'Configuration updated',
    coreHost: CORE_HOST,
    corePort: CORE_PORT
  });
});

// Status Endpoint
app.get('/status', (req, res) => {
  res.json({
    server: 'AppleJuice WebUI',
    status: 'running',
    port: PORT,
    proxy: `http://${CORE_HOST}:${CORE_PORT}`,
    timestamp: new Date().toISOString()
  });
});

// Update Endpoint
app.post('/update', (req, res) => {
  console.log('[UPDATE] Update request received');

  // Prüfen, ob automatische Updates deaktiviert sind
  if (process.env.DISABLE_AUTO_UPDATE === 'true') {
    console.log('[UPDATE] Automatic updates are disabled by environment variable');
    return res.status(403).json({
      error: 'Updates disabled',
      message: 'Automatische Updates sind durch Systemeinstellungen deaktiviert'
    });
  }

  const { exec } = require('child_process');
  const updateScript = path.join(__dirname, 'scripts', 'update.sh');

  // Prüfen, ob das Update-Skript existiert
  if (!require('fs').existsSync(updateScript)) {
    console.error('[UPDATE] Update script not found at:', updateScript);
    return res.status(404).json({
      error: 'Update script not found',
      message: 'Das Update-Skript wurde nicht gefunden'
    });
  }

  console.log('[UPDATE] Executing update script:', updateScript);

  try {
    // Update-Skript ausführen
    exec(`bash ${updateScript}`, (error, stdout, stderr) => {
      if (error) {
        console.error('[UPDATE] Error executing update script:', error);
        return res.status(500).json({
          error: 'Update failed',
          message: 'Update konnte nicht durchgeführt werden',
          details: error.message,
          stderr: stderr
        });
      }

      console.log('[UPDATE] Update script output:', stdout);

      // Erfolgreiche Antwort senden
      res.json({
        message: 'Update initiated',
        status: 'success',
        details: 'Der Server wird in Kürze neu gestartet'
      });

      // Server nach kurzer Verzögerung neu starten
      setTimeout(() => {
        console.log('[UPDATE] Restarting server...');
        process.exit(0); // Der Server wird durch den Container-Restart neu gestartet
      }, 3000);
    });
  } catch (err) {
    console.error('[UPDATE] Exception during update process:', err);
    res.status(500).json({
      error: 'Update exception',
      message: 'Fehler beim Starten des Update-Prozesses',
      details: err.message
    });
  }
});

// Server starten
app.listen(PORT, () => {
  console.log(`[OK] Server läuft auf http://localhost:${PORT}`);
  console.log(`[STATUS] Status: http://localhost:${PORT}/status`);
  console.log(`[API] API Proxy: http://localhost:${PORT}/api/*`);
  console.log(`[PROXY] Special Proxy: http://localhost:${PORT}/proxy/*`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SHUTDOWN] Server wird beendet...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[SHUTDOWN] Server wird beendet...');
  process.exit(0);
});
