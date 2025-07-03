const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Default AppleJuice Core settings
let CORE_HOST = process.env.APPLEJUICE_CORE_HOST || '192.168.178.222';
let CORE_PORT = process.env.APPLEJUICE_CORE_PORT || '9854';

console.log(`🚀 Starting AppleJuice Nexus Server on port ${PORT}`);
console.log(`🔗 Proxying API requests to: http://${CORE_HOST}:${CORE_PORT}`);

// Middleware für JSON parsing
app.use(express.json());

// Dynamic proxy function
function createDynamicProxy() {
  return createProxyMiddleware({
    target: `http://${CORE_HOST}:${CORE_PORT}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api': '', // /api/settings.xml wird zu /settings.xml
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`📡 Proxy: ${req.method} ${req.url} -> http://${CORE_HOST}:${CORE_PORT}${req.url.replace('/api', '')}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      // CORS Headers hinzufügen
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
      
      console.log(`✅ Response: ${proxyRes.statusCode} for ${req.url}`);
    },
    onError: (err, req, res) => {
      console.error(`❌ Proxy Error: ${err.message}`);
      res.status(500).json({ 
        error: 'Proxy Error', 
        message: 'Kann nicht mit AppleJuice Core verbinden',
        details: err.message 
      });
    }
  });
}

// API Proxy - alle /api/* Anfragen werden an AppleJuice Core weitergeleitet
app.use('/api', (req, res, next) => {
  // Recreate proxy with current CORE_HOST and CORE_PORT
  const proxy = createDynamicProxy();
  proxy(req, res, next);
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
      message: 'AppleJuice Nexus API Server',
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
    console.log(`🔧 Core Host updated to: ${CORE_HOST}`);
  }
  
  if (corePort) {
    CORE_PORT = corePort;
    console.log(`🔧 Core Port updated to: ${CORE_PORT}`);
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
    server: 'AppleJuice Nexus',
    status: 'running',
    port: PORT,
    proxy: `http://${CORE_HOST}:${CORE_PORT}`,
    timestamp: new Date().toISOString()
  });
});

// Server starten
app.listen(PORT, () => {
  console.log(`✅ Server läuft auf http://localhost:${PORT}`);
  console.log(`📊 Status: http://localhost:${PORT}/status`);
  console.log(`🔧 API Proxy: http://localhost:${PORT}/api/*`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Server wird beendet...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Server wird beendet...');
  process.exit(0);
});