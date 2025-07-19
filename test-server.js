import express from 'express';

const app = express();
const PORT = 9851;

// Middleware für CORS (Simulation des alten Core-Servers)
app.use((req, res, next) => {
  // Kein CORS-Header - wie der alte Server
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test-Passwort MD5: "test" = "098f6bcd4621d373cade4e832627b4f6"
const validPasswordHash = "098f6bcd4621d373cade4e832627b4f6";

// Mock settings.xml für erfolgreiche Anmeldung
app.get('/xml/settings.xml', (req, res) => {
  const { password } = req.query;
  
  console.log(`[TEST-SERVER] Anfrage: /xml/settings.xml mit Passwort-Hash: ${password}`);
  
  if (password === validPasswordHash) {
    // Erfolgreiche Anmeldung - XML-Inhalt zurückgeben
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<settings>
  <maxdownloads>4</maxdownloads>
  <maxuploads>2</maxuploads>
  <maxconnections>100</maxconnections>
  <downloaddir>C:\\Downloads</downloaddir>
  <tempdir>C:\\Temp</tempdir>
  <nickname>TestUser</nickname>
  <serverport>4534</serverport>
</settings>`;
    
    res.set('Content-Type', 'application/xml');
    res.send(xmlContent);
  } else {
    // Falsche Anmeldung - Leerer Inhalt oder Fehler
    console.log(`[TEST-SERVER] Falsches Passwort! Erwartet: ${validPasswordHash}, Erhalten: ${password}`);
    res.status(401).send(''); // Leere Antwort für falsches Passwort
  }
});

// Mock information.xml
app.get('/xml/information.xml', (req, res) => {
  const { password } = req.query;
  
  if (password === validPasswordHash) {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<information>
  <downloads>5</downloads>
  <uploads>2</uploads>
  <servers>3</servers>
  <users>15</users>
  <downloadspeed>1024000</downloadspeed>
  <uploadspeed>512000</uploadspeed>
</information>`;
    
    res.set('Content-Type', 'application/xml');
    res.send(xmlContent);
  } else {
    res.status(401).send('');
  }
});

// Mock downloads.xml
app.get('/xml/downloads.xml', (req, res) => {
  const { password } = req.query;
  
  if (password === validPasswordHash) {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<downloads>
  <download>
    <filename>Test File 1.zip</filename>
    <size>1048576</size>
    <loaded>524288</loaded>
    <status>downloading</status>
  </download>
  <download>
    <filename>Test File 2.mp3</filename>
    <size>5242880</size>
    <loaded>5242880</loaded>
    <status>complete</status>
  </download>
</downloads>`;
    
    res.set('Content-Type', 'application/xml');
    res.send(xmlContent);
  } else {
    res.status(401).send('');
  }
});

// Catch-all für andere Anfragen
app.use('*', (req, res) => {
  console.log(`[TEST-SERVER] Unbekannte Anfrage: ${req.method} ${req.originalUrl}`);
  res.status(404).send('Not Found');
});

app.listen(PORT, () => {
  console.log(`🧪 Test Core-Server läuft auf Port ${PORT}`);
  console.log(`📝 Test-Passwort: "test" (MD5: ${validPasswordHash})`);
  console.log(`🔗 Test-URL: http://localhost:${PORT}`);
  console.log(`⚡ Verfügbare Endpunkte:`);
  console.log(`   - GET /xml/settings.xml?password=HASH`);
  console.log(`   - GET /xml/information.xml?password=HASH`);
  console.log(`   - GET /xml/downloads.xml?password=HASH`);
});