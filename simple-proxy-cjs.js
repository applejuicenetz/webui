#!/usr/bin/env node
const http = require('http')
const net = require('net')
const { URL } = require('url')

// Konfiguration
const PROXY_PORT = process.env.PROXY_PORT || 3001
const AJ_HOST = process.env.VITE_AJ_CORE_HOST || '192.168.178.222'
const AJ_PORT = process.env.VITE_AJ_CORE_PORT || 9854

console.log(`[START] Starting AppleJuice Proxy Server...`)
console.log(`[CONFIG] Config: AJ_HOST=${AJ_HOST}, AJ_PORT=${AJ_PORT}, PROXY_PORT=${PROXY_PORT}`)

// Einfacher HTTP-Server
const server = http.createServer((req, res) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`)

  // CORS Preflight Request
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Cache-Control',
      'Access-Control-Max-Age': '86400'
    })
    res.end()
    return
  }

  // Nur GET-Requests weiterleiten
  if (req.method !== 'GET') {
    res.writeHead(405, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*'
    })
    res.end('Method Not Allowed')
    return
  }

  // URL parsen
  const targetPath = req.url.replace('/api/', '/xml/')
  console.log(`[PROXY] ${req.url} -> http://${AJ_HOST}:${AJ_PORT}${targetPath}`)

  // Raw TCP-Socket verwenden (umgeht HTTP-Parser)
  const socket = net.createConnection(AJ_PORT, AJ_HOST, () => {
    console.log(`[CONNECT] Connected to ${AJ_HOST}:${AJ_PORT}`)

    // HTTP-Request manuell senden (HTTP/1.0 für bessere Kompatibilität)
    const httpRequest = [
      `GET ${targetPath} HTTP/1.0`,
      `Host: ${AJ_HOST}`,
      `User-Agent: Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)`,
      `Accept: */*`,
      `Connection: close`,
      ``,
      ``
    ].join('\r\n')

    console.log(`[SEND] Sending HTTP request:`)
    console.log(httpRequest.replace(/\r\n/g, '\\r\\n'))

    socket.write(httpRequest)
  })

  let rawResponse = ''
  let headersParsed = false
  let statusCode = 200
  let body = ''

  socket.on('data', (chunk) => {
    console.log(`[DATA] Received chunk: ${chunk.length} bytes`)
    rawResponse += chunk.toString()

    if (!headersParsed) {
      // Prüfe verschiedene Header-Trennzeichen
      let headerEndIndex = rawResponse.indexOf('\r\n\r\n')
      let headerSeparator = 4

      if (headerEndIndex === -1) {
        headerEndIndex = rawResponse.indexOf('\n\n')
        headerSeparator = 2
      }

      if (headerEndIndex !== -1) {
        headersParsed = true
        const headerSection = rawResponse.substring(0, headerEndIndex)
        body = rawResponse.substring(headerEndIndex + headerSeparator)

        console.log(`[HEADERS] Raw Headers:`)
        console.log(headerSection)
        console.log(`[BODY] Initial body length: ${body.length}`)
        console.log(`[BODY] Initial body preview: ${body.substring(0, 100)}...`)

        // Status-Code extrahieren
        const statusMatch = headerSection.match(/HTTP\/1\.[01] (\d+)/)
        if (statusMatch) {
          statusCode = parseInt(statusMatch[1])
        }

        console.log(`[RESPONSE] Status: ${statusCode}`)

        // Prüfung auf Fehler-Status-Codes
        if (statusCode === 302 && headerSection.includes('location: /wrongpassword')) {
          console.log('[AUTH ERROR] Wrong password detected')
          res.writeHead(401, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Cache-Control',
          })
          res.end(JSON.stringify({
            error: 'Authentication failed',
            message: 'Wrong password',
            code: 'WRONG_PASSWORD'
          }))
          return
        }

        // Sichere Headers setzen mit CORS
        const safeHeaders = {
          'Content-Type': 'application/xml; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Cache-Control',
          'Access-Control-Allow-Credentials': 'false',
          'Cache-Control': 'no-cache'
        }

        res.writeHead(statusCode, safeHeaders)

        // Body sofort senden falls vorhanden
        if (body) {
          console.log(`[BODY] Initial body part: ${body.length} chars`)
          res.write(body)
        }
      } else {
        // Noch keine kompletten Headers
        console.log(`[PARTIAL] Partial response: ${rawResponse.length} chars`)
        if (rawResponse.length > 0) {
          console.log(`[PARTIAL] Raw response so far: ${rawResponse.substring(0, 100)}...`)
        }
      }
    } else {
      // Weitere Body-Daten
      body += chunk.toString()
      console.log(`[BODY] Additional body: ${chunk.length} chars`)
      res.write(chunk)
    }
  })

  socket.on('end', () => {
    console.log(`[OK] Connection ended`)
    console.log(`[BODY] Total body length: ${body.length}`)

    if (body.length > 0) {
      console.log(`[BODY] Body preview: ${body.substring(0, 200)}...`)
    }

    res.end()
  })

  socket.on('error', (err) => {
    console.error('[ERROR] Socket error:', err.message)
    if (!res.headersSent) {
      res.writeHead(500, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      })
      res.end('Socket Error: ' + err.message)
    }
  })

  // Request timeout
  socket.setTimeout(10000, () => {
    console.error('[ERROR] Request timeout')
    socket.destroy()
    if (!res.headersSent) {
      res.writeHead(504, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      })
      res.end('Request Timeout')
    }
  })
})

server.listen(PROXY_PORT, () => {
  console.log(`[OK] AppleJuice Proxy Server läuft auf Port ${PROXY_PORT}`)
  console.log(`[INFO] Verwende: http://localhost:${PROXY_PORT}/api/...`)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[SHUTDOWN] Shutting down proxy server...')
  server.close(() => {
    console.log('[OK] Proxy server stopped')
    process.exit(0)
  })
})

process.on('SIGTERM', () => {
  console.log('\n[SHUTDOWN] Shutting down proxy server...')
  server.close(() => {
    console.log('[OK] Proxy server stopped')
    process.exit(0)
  })
})
