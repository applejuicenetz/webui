import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { config } from 'dotenv';
import http from 'http';
import net from 'net';

// Lade Umgebungsvariablen
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || process.env.VITE_PROXY_PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Management
app.use(session({
  secret: process.env.SESSION_SECRET || 'applejuice-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Deaktiviert für Docker/HTTP-Umgebungen
    httpOnly: true, // Verhindert XSS-Angriffe
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' // Erlaubt Cross-Site-Requests für bessere Kompatibilität
  }
}));

// Session debugging middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log(`API Request: ${req.method} ${req.path}`);
    console.log(`Session ID: ${req.sessionID}`);
    console.log(`Session authenticated: ${req.session?.authenticated}`);
    console.log(`Cookies:`, req.headers.cookie);
  }
  next();
});

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist')));

// Helper function to create MD5 hash
function createMD5Hash(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

// Helper function to make request to core server (optimized for old AppleJuice Core)
async function makeProxyRequest(coreHost, corePort, type, file, password) {
  const hashedPassword = createMD5Hash(password);
  const path = `/${type}/${file}?password=${hashedPassword}`;
  
  console.log('makeProxyRequest called with:', {
    coreHost,
    corePort,
    type,
    file,
    hashedPassword: hashedPassword ? hashedPassword.substring(0, 8) + '...' : 'undefined'
  });
  
  return new Promise((resolve, reject) => {
    // Verwende raw socket für alten AppleJuice Core (wegen nicht-standard HTTP)
    const socket = new net.Socket();
    
    console.log(`Connecting to AppleJuice Core: http://${coreHost}:${corePort}${path}`);
    
    let responseData = '';
    let headersParsed = false;
    let headers = {};
    let statusCode = 200;
    
    socket.setTimeout(10000);
    
    socket.connect(parseInt(corePort), coreHost, () => {
      console.log('Raw socket connected to Core');
      
      // Sende HTTP/1.0 Request (kompatibler mit alten Servern)
      const request = `GET ${path} HTTP/1.0\r\n` +
                     `Host: ${coreHost}:${corePort}\r\n` +
                     `User-Agent: AppleJuice-WebUI-Proxy/1.0\r\n` +
                     `Accept: */*\r\n` +
                     `Connection: close\r\n` +
                     `\r\n`;
      
      console.log('Sending raw HTTP request:', request.replace(/\r\n/g, '\\r\\n'));
      socket.write(request);
    });
    
    socket.on('data', (chunk) => {
      responseData += chunk.toString();
      console.log(`Received chunk (${chunk.length} bytes)`);
    });
    
    socket.on('close', () => {
      console.log('Raw socket closed, processing response...');
      console.log('Full raw response length:', responseData.length);
      console.log('Raw response start:', responseData.substring(0, 200));
      
      let finalXmlData = responseData;
      
      // Prüfe ob Response HTTP-Headers enthält
      if (responseData.includes('\r\n\r\n')) {
        console.log('HTTP headers detected, extracting body...');
        
        // Finde das Ende der Headers
        const headerEndIndex = responseData.indexOf('\r\n\r\n');
        const headerSection = responseData.substring(0, headerEndIndex);
        const bodySection = responseData.substring(headerEndIndex + 4);
        
        console.log('Header section:', headerSection);
        console.log('Body section length:', bodySection.length);
        console.log('Body section start:', bodySection.substring(0, 100));
        
        // Status Code extrahieren
        const firstLine = headerSection.split('\r\n')[0];
        const statusMatch = firstLine.match(/HTTP\/[\d.]+\s+(\d+)/);
        if (statusMatch) {
          statusCode = parseInt(statusMatch[1]);
          console.log('Extracted status code:', statusCode);
        }
        
        finalXmlData = bodySection;
      }
      
      // Bereinige Whitespace
      finalXmlData = finalXmlData.trim();
      
      // Finde XML-Start und entferne alles davor
      const xmlStartIndex = finalXmlData.indexOf('<?xml');
      if (xmlStartIndex > 0) {
        console.log('Found XML declaration at position:', xmlStartIndex);
        console.log('Removing prefix:', finalXmlData.substring(0, xmlStartIndex));
        finalXmlData = finalXmlData.substring(xmlStartIndex);
      } else {
        // Fallback: Suche nach erstem XML-Tag
        const xmlTagIndex = finalXmlData.indexOf('<');
        if (xmlTagIndex > 0) {
          console.log('Found XML tag at position:', xmlTagIndex);
          console.log('Removing prefix:', finalXmlData.substring(0, xmlTagIndex));
          finalXmlData = finalXmlData.substring(xmlTagIndex);
        }
      }
      
      console.log('Final XML data length:', finalXmlData.length);
      console.log('Final XML preview:', finalXmlData.substring(0, 200));
      console.log('Final result starts with XML:', finalXmlData.startsWith('<?xml') || finalXmlData.startsWith('<'));
      
      resolve({
        success: statusCode === 200,
        data: finalXmlData,
        status: statusCode,
        headers: headers
      });
    });
    

    
    socket.on('error', (error) => {
      console.error(`Core Connection Error: ${error.message}`);
      resolve({
        success: false,
        error: error.message,
        type: 'network_error'
      });
    });
    
    socket.on('timeout', () => {
      console.error('Core Connection Timeout');
      socket.destroy();
      resolve({
        success: false,
        error: 'Connection timeout',
        type: 'timeout_error'
      });
    });
  });
}

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { core_host, core_port, password } = req.body;
  
  console.log('Login attempt:', {
    host: core_host,
    port: core_port,
    password: password ? '****' : 'undefined'
  });
  
  if (!core_host || !core_port || !password) {
    return res.status(400).json({
      success: false,
      error: 'Alle Felder sind erforderlich'
    });
  }

  try {
    // Teste die Verbindung mit settings.xml
    console.log(`Attempting connection to ${core_host}:${core_port}`);
    const result = await makeProxyRequest(core_host, core_port, 'xml', 'settings.xml', password);
    
    if (!result.success) {
      // Netzwerkfehler - Host nicht erreichbar
      return res.status(503).json({
        success: false,
        error: 'Host nicht erreichbar',
        type: 'network_error'
      });
    }

    // Prüfe ob die Antwort Inhalt hat (erfolgreiche Authentifizierung)
    if (result.data && result.data.trim().length > 0 && !result.data.includes('error') && !result.data.includes('unauthorized')) {
      // Erfolgreiche Anmeldung - Speichere Session
      req.session.authenticated = true;
      req.session.coreHost = core_host;
      req.session.corePort = core_port;
      req.session.password = password;
      
      console.log('Login successful - Session created:');
      console.log('- Session ID:', req.sessionID);
      console.log('- Authenticated:', req.session.authenticated);
      console.log('- Core Host:', req.session.coreHost);
      console.log('- Core Port:', req.session.corePort);
      
      // Speichere Session explizit
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
        } else {
          console.log('Session saved successfully');
        }
      });
      
      return res.json({
        success: true,
        message: 'Erfolgreich angemeldet'
      });
    } else {
      // Fallback oder fehlerhafte Antwort - Passwort falsch
      return res.status(401).json({
        success: false,
        error: 'Passwort falsch',
        type: 'auth_error'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Interner Serverfehler'
    });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        success: false,
        error: 'Fehler beim Abmelden'
      });
    }
    
    res.json({
      success: true,
      message: 'Erfolgreich abgemeldet'
    });
  });
});

// Check authentication status
app.get('/api/auth-status', (req, res) => {
  console.log('Auth status check:');
  console.log('- Session ID:', req.sessionID);
  console.log('- Session exists:', !!req.session);
  console.log('- Session authenticated:', req.session?.authenticated);
  console.log('- Session data:', JSON.stringify(req.session, null, 2));
  
  if (req.session.authenticated) {
    return res.json({
      authenticated: true,
      coreHost: req.session.coreHost,
      corePort: req.session.corePort,
      sessionId: req.sessionID
    });
  } else {
    return res.json({
      authenticated: false,
      sessionId: req.sessionID,
      sessionExists: !!req.session
    });
  }
});

// Direkte XML-Proxy Route (für alte Frontend-Kompatibilität mit auth.js)
app.get('/api/xml/:file', async (req, res) => {
  const { file } = req.params;
  const { password, host, port } = req.query;
  
  // Verwende Query-Parameter oder Fallback zu Session-Daten  
  const coreHost = host || req.session?.coreHost || 'localhost';
  const corePort = port || req.session?.corePort || '9851';
  
  console.log(`XML Proxy Request: ${file} für ${coreHost}:${corePort}`);
  
  if (!password) {
    return res.status(400).send('Password parameter required');
  }

  try {
    const result = await makeProxyRequest(coreHost, corePort, 'xml', file, password);
    
    if (!result.success) {
      console.log(`Core nicht erreichbar: ${result.error}`);
      return res.status(503).send(`Core server not reachable: ${result.error}`);
    }

    console.log(`Core Antwort: Status ${result.status}, ${result.data.length} Zeichen`);

    // Setze passende Headers für XML-Antwort
    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'no-cache'
    });

    // Sende XML-Daten direkt weiter (wie der alte Core)
    res.send(result.data);
    
  } catch (error) {
    console.error('XML Proxy Error:', error);
    res.status(500).send(`Internal server error: ${error.message}`);
  }
});

// Universal proxy endpoint
app.get('/api/proxy/:type/:file(*)', async (req, res) => {
  console.log(`Proxy request: ${req.method} /api/proxy/${req.params.type}/${req.params.file}`);
  console.log('Session ID:', req.sessionID);
  console.log('Session authenticated:', req.session?.authenticated);
  console.log('Session data:', JSON.stringify(req.session, null, 2));
  
  if (!req.session.authenticated) {
    console.log('Request not authenticated - Session details:');
    console.log('- Session exists:', !!req.session);
    console.log('- Session ID:', req.sessionID);
    console.log('- Authenticated flag:', req.session?.authenticated);
    return res.status(401).json({
      success: false,
      error: 'Nicht angemeldet'
    });
  }

  const { type, file } = req.params;
  const { coreHost, corePort, password } = req.session;
  
  console.log(`Session info: ${coreHost}:${corePort} (password: ${password ? 'set' : 'missing'})`);

  try {
    console.log(`Making proxy request to core: ${type}/${file}`);
    const result = await makeProxyRequest(coreHost, corePort, type, file, password);
    
    console.log(`Proxy result: success=${result.success}, dataLength=${result.data?.length || 0}`);
    
    if (!result.success) {
      console.log(`Core request failed: ${result.error}`);
      return res.status(503).json({
        success: false,
        error: 'Host nicht erreichbar',
        type: 'network_error',
        details: result.error
      });
    }

    // Log first few characters to see what we got
    const preview = result.data ? result.data.substring(0, 100) : 'NO DATA';
    console.log(`Response preview: "${preview}"`);

    // Set appropriate headers
    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    // Return the raw data
    res.send(result.data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      success: false,
      error: 'Interner Serverfehler',
      details: error.message
    });
  }
});

// POST proxy endpoint for commands
app.post('/api/proxy/:type/:file(*)', async (req, res) => {
  if (!req.session.authenticated) {
    return res.status(401).json({
      success: false,
      error: 'Nicht angemeldet'
    });
  }

  const { type, file } = req.params;
  const { coreHost, corePort, password } = req.session;

  try {
    const hashedPassword = createMD5Hash(password);
    const url = `http://${coreHost}:${corePort}/${type}/${file}?password=${hashedPassword}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'User-Agent': 'AppleJuice-WebUI-Proxy/1.0',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(req.body).toString()
    });

    const data = await response.text();
    
    // Set appropriate headers
    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.send(data);
  } catch (error) {
    console.error('Proxy POST error:', error);
    res.status(500).json({
      success: false,
      error: 'Interner Serverfehler'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve Vue.js app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Interner Serverfehler'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
  console.log(`📁 Statische Dateien werden aus './dist' ausgeliefert`);
  console.log(`🔗 Proxy-Endpunkte verfügbar unter '/api/proxy/:type/:file'`);
});