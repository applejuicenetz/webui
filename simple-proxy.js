#!/usr/bin/env node

import http from 'http'
import net from 'net'
import { URL } from 'url'

// Einfacher robuster Proxy für AppleJuice-Server
const PROXY_PORT = 3001
const AJ_HOST = process.env.VITE_AJ_CORE_HOST || '192.168.178.222'
const AJ_PORT = process.env.VITE_AJ_CORE_PORT || '9854'

console.log('🚀 Starting AppleJuice Proxy Server...')
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
  const targetUrl = `http://${AJ_HOST}:${AJ_PORT}${targetPath}`

  console.log(`🔄 Proxy: ${req.url} -> ${targetUrl}`)

  // Rohe HTTP-Anfrage erstellen
  const proxyReq = http.request({
    hostname: AJ_HOST,
    port: AJ_PORT,
    path: targetPath,
    method: req.method,
    headers: {
      'User-Agent': 'AppleJuice-WebUI',
      'Accept': '*/*',
      'Connection': 'close'
    }
  }, (proxyRes) => {
    console.log(`📤 Response: ${proxyRes.statusCode}`)

    // Antwort-Headers setzen
    res.writeHead(proxyRes.statusCode || 200, {
      'Content-Type': proxyRes.headers['content-type'] || 'application/xml',
      'Access-Control-Allow-Origin': '*'
    })

    // Antwort-Body weiterleiten
    proxyRes.on('data', (chunk) => {
      res.write(chunk)
    })

    proxyRes.on('end', () => {
      res.end()
    })

    proxyRes.on('error', (err) => {
      console.error('❌ Response error:', err.message)
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end('Response Error: ' + err.message)
      }
    })
  })

  proxyReq.on('error', (err) => {
    console.error('❌ Request error:', err.message)
    res.writeHead(500, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*'
    })
    res.end('Request Error: ' + err.message)
  })

  // Request Body weiterleiten
  req.on('data', (chunk) => {
    proxyReq.write(chunk)
  })

  req.on('end', () => {
    proxyReq.end()
  })
})

server.listen(PROXY_PORT, () => {
  console.log(`✅ AppleJuice Proxy Server läuft auf Port ${PROXY_PORT}`)
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
