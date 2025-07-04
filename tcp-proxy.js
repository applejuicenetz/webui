#!/usr/bin/env node

import http from 'http'
import net from 'net'

// Robuster TCP-basierter Proxy für AppleJuice-Server
const PROXY_PORT = 3001
const AJ_HOST = process.env.VITE_AJ_CORE_HOST || '192.168.178.222'
const AJ_PORT = process.env.VITE_AJ_CORE_PORT || '9854'

console.log('🚀 Starting AppleJuice TCP Proxy Server...')
console.log(`📡 Proxy Port: ${PROXY_PORT}`)
console.log(`🎯 Target: http://${AJ_HOST}:${AJ_PORT}`)

const server = http.createServer((req, res) => {
  console.log(`📥 ${req.method} ${req.url}`)

  // CORS-Headers für alle Requests setzen
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Cache-Control')

  // Preflight-Request beantworten
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  // Nur /api Pfade verarbeiten
  if (!req.url.startsWith('/api')) {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not Found - Use /api paths')
    return
  }

  // /api -> /xml umwandeln
  const targetPath = req.url.replace('/api', '/xml')

  console.log(`🔄 Proxy: ${req.url} -> ${targetPath}`)

  // Rohe TCP-Verbindung für robuste Kommunikation
  const socket = new net.Socket()
  let responseData = ''

  socket.connect(AJ_PORT, AJ_HOST, () => {
    console.log(`🔗 TCP-Verbindung zu ${AJ_HOST}:${AJ_PORT}`)

    // Rohe HTTP-Anfrage senden
    const httpRequest = [
      `GET ${targetPath} HTTP/1.1`,
      `Host: ${AJ_HOST}:${AJ_PORT}`,
      `User-Agent: AppleJuice-WebUI`,
      `Accept: */*`,
      `Connection: close`,
      ``, // Leere Zeile für Ende der Header
      ``
    ].join('\r\n')

    socket.write(httpRequest)
  })

  socket.on('data', (chunk) => {
    responseData += chunk.toString()
  })

  socket.on('close', () => {
    console.log('🔗 TCP-Verbindung geschlossen')

    try {
      // HTTP-Response parsen (robust)
      let headerPart = ''
      let bodyPart = ''

      // Suche nach der Header-Body-Trennung
      const doubleCrLf = responseData.indexOf('\r\n\r\n')
      const doubleLf = responseData.indexOf('\n\n')

      if (doubleCrLf !== -1) {
        headerPart = responseData.substring(0, doubleCrLf)
        bodyPart = responseData.substring(doubleCrLf + 4)
      } else if (doubleLf !== -1) {
        headerPart = responseData.substring(0, doubleLf)
        bodyPart = responseData.substring(doubleLf + 2)
      } else {
        // Fallback: komplette Antwort ist Body
        bodyPart = responseData
      }

      // Status-Code extrahieren
      const statusMatch = headerPart.match(/HTTP\/1\.[01]\s+(\d+)/)
      const statusCode = statusMatch ? parseInt(statusMatch[1]) : 200

      console.log(`📤 TCP Response: ${statusCode}`)
      console.log(`📄 Body length: ${bodyPart.length}`)

      // Antwort senden
      res.writeHead(statusCode, {
        'Content-Type': 'application/xml',
        'Access-Control-Allow-Origin': '*'
      })

      // Body senden
      res.write(bodyPart)
      res.end()

    } catch (parseError) {
      console.error('❌ Parse error:', parseError.message)
      console.log('📄 Raw response (first 200 chars):', responseData.substring(0, 200))

      res.writeHead(500, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      })
      res.end('Parse Error: ' + parseError.message)
    }
  })

  socket.on('error', (err) => {
    console.error('❌ TCP error:', err.message)
    res.writeHead(500, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*'
    })
    res.end('TCP Error: ' + err.message)
  })

  socket.on('timeout', () => {
    console.error('❌ TCP timeout')
    socket.destroy()
    res.writeHead(504, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*'
    })
    res.end('TCP Timeout')
  })

  // Timeout setzen
  socket.setTimeout(10000)
})

server.listen(PROXY_PORT, () => {
  console.log(`✅ AppleJuice TCP Proxy Server läuft auf Port ${PROXY_PORT}`)
  console.log(`🌐 Verwende: http://localhost:${PROXY_PORT}/api/...`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⏹️  Shutting down...')
  server.close(() => {
    console.log('✅ Proxy stopped')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('⏹️  Shutting down...')
  server.close(() => {
    console.log('✅ Proxy stopped')
    process.exit(0)
  })
})
