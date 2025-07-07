/**
 * Core Data Store
 * Verwaltet die Zustandsdaten vom AppleJuice Core
 */

import { defineStore } from 'pinia'
import coreService from '../services/coreService.js'
import { parseXmlToJson, AJXmlParser, DataExtractor, XmlValidator } from '../utils/xmlParser.js'

export const useCoreStore = defineStore('core', {
  state: () => ({
    // Hauptdaten
    coreData: {
      timestamp: null,
      server: {
        name: 'AppleJuice Core',
        ip: '127.0.0.1',
        description: 'AppleJuice File-Sharing'
      },
      statistics: {
        downloads: { active: 0, total: 0 },
        uploads: { active: 0 },
        shares: { size: '0 B', count: 0 },
        credits: '0 B'
      },
      coreInfo: {
        serverTime: new Date().toLocaleString('de-DE'),
        version: '0.0.0',
        os: 'Unknown',
        uptime: '0min',
        connections: 0,
        bytesIn: '0 B',
        bytesOut: '0 B',
        downloadSpeed: '0 B/s',
        uploadSpeed: '0 B/s',
        maxUploadSlots: 0
      },
      networkInfo: {
        download: '0 B/s',
        upload: '0 B/s',
        sharedUsers: 0,
        totalFiles: '0',
        totalSize: '0 B',
        serverIp: 'Unknown',
        serverName: 'Unknown',
        welcomeMessage: null,
        firewalled: false,
        servers: []
      }
    },

    // Status-Informationen
    isLoading: false,
    isConnected: false,
    lastUpdate: null,
    lastError: null,
    updateInterval: null,
    autoUpdateEnabled: false,
    connectionRetries: 0,
    maxRetries: 3,

    // Raw-Daten für erweiterte Ansichten
    rawData: {
      information: null,
      modified: null,
      downloads: null,
      uploads: null,
      shared: null,
      server: null,
      network: null
    }
  }),

  getters: {
    /**
     * Ist der Core online?
     */
    isOnline: (state) => {
      return state.isConnected && state.lastUpdate &&
             (Date.now() - new Date(state.lastUpdate).getTime()) < 30000
    },

    /**
     * Uptime in Minuten
     */
    uptimeMinutes: (state) => {
      const uptime = state.coreData.coreInfo.uptime
      if (!uptime) return 0

      const matches = uptime.match(/(\d+)h?\s*(\d+)min?/)
      if (matches) {
        return parseInt(matches[1]) * 60 + parseInt(matches[2])
      }
      return 0
    },

    /**
     * Formatierte letzte Aktualisierung
     */
    lastUpdateFormatted: (state) => {
      if (!state.lastUpdate) return 'Nie'
      return new Date(state.lastUpdate).toLocaleString('de-DE')
    },

    /**
     * Verbindungsstatus als Text
     */
    connectionStatus: (state) => {
      if (state.isLoading) return 'Verbinde...'
      if (state.isConnected) return 'Verbunden'
      if (state.lastError) return 'Fehler'
      return 'Nicht verbunden'
    },

    /**
     * Gesamte Download-Aktivität
     */
    downloadActivity: (state) => {
      const { active, total } = state.coreData.statistics.downloads
      if (total === 0) return 'Keine Downloads'
      return `${active}/${total} aktiv`
    },

    /**
     * Gesamte Upload-Aktivität
     */
    uploadActivity: (state) => {
      const { active } = state.coreData.statistics.uploads
      return active === 0 ? 'Keine Uploads' : `${active} aktiv`
    },

    /**
     * Netzwerk-Aktivität
     */
    networkActivity: (state) => {
      const { download, upload } = state.coreData.networkInfo
      if (download === '0 B' && upload === '0 B') {
        return 'Keine Aktivität'
      }
      return `↓ ${download} / ↑ ${upload}`
    }
  },

  actions: {
    /**
     * Core-Daten laden
     */
    async loadCoreData() {
      this.isLoading = true
      this.lastError = null

      try {
        console.log('[STORE] Loading core data...')
        const data = await coreService.getAllCoreData()

        this.coreData = data
        this.rawData = data.raw
        this.isConnected = true
        this.lastUpdate = new Date().toISOString()
        this.connectionRetries = 0

        console.log('[STORE] Core data loaded successfully')
        return data
      } catch (error) {
        console.error('[STORE] Error loading core data:', error)
        this.lastError = error.message
        this.isConnected = false
        this.connectionRetries++

        // Bei Authentifizierungsfehlern nicht weiter versuchen
        if (error.message.includes('Wrong password') ||
            error.message.includes('Not authenticated')) {
          this.stopAutoUpdate()
          throw error
        }

        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Einzelnen Endpoint laden
     */
    async loadEndpoint(type, endpoint) {
      try {
        console.log(`[STORE] Loading ${type}/${endpoint}...`)
        const data = await coreService.command(type, endpoint)

        // In rawData speichern
        const key = endpoint.replace('.xml', '')
        this.rawData[key] = data

        return data
      } catch (error) {
        console.error(`[STORE] Error loading ${type}/${endpoint}:`, error)
        throw error
      }
    },

    /**
     * Auto-Update starten
     */
    startAutoUpdate(interval = 30000) {
      if (this.updateInterval) {
        this.stopAutoUpdate()
      }

      console.log(`[STORE] Starting auto-update with ${interval}ms interval`)

      this.autoUpdateEnabled = true
      this.updateInterval = setInterval(async () => {
        if (this.isLoading) {
          console.log('[STORE] Update already in progress, skipping...')
          return
        }

        try {
          await this.loadCoreData()
        } catch (error) {
          console.error('[STORE] Auto-update error:', error)

          // Bei zu vielen Fehlern Auto-Update stoppen
          if (this.connectionRetries > this.maxRetries) {
            console.warn('[STORE] Too many connection errors, stopping auto-update')
            this.stopAutoUpdate()
          }
        }
      }, interval)
    },

    /**
     * Auto-Update stoppen
     */
    stopAutoUpdate() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval)
        this.updateInterval = null
        this.autoUpdateEnabled = false
        console.log('[STORE] Auto-update stopped')
      }
    },

    /**
     * Manueller Refresh
     */
    async refresh() {
      console.log('[STORE] Manual refresh triggered')
      return this.loadCoreData()
    },

    /**
     * Verbindung zurücksetzen
     */
    resetConnection() {
      this.isConnected = false
      this.lastError = null
      this.connectionRetries = 0
      this.stopAutoUpdate()
    },

    /**
     * Cache löschen
     */
    clearCache() {
      coreService.clearCache()
      this.rawData = {
        information: null,
        modified: null,
        downloads: null,
        uploads: null,
        shared: null,
        server: null,
        network: null
      }
    },

    /**
     * Store zurücksetzen
     */
    reset() {
      this.stopAutoUpdate()
      this.clearCache()
      this.isConnected = false
      this.lastError = null
      this.connectionRetries = 0
      this.lastUpdate = null
    },

    /**
     * Information.xml Parser - Allgemeine Core-Informationen
     */
    parseInformationXml(xmlString) {
      try {
        console.log('[CORE STORE] Parsing Information.xml')

        // Validierung der XML-Struktur
        if (!XmlValidator.isValidXml(xmlString)) {
          throw new Error('Invalid XML structure in Information.xml')
        }

        if (!XmlValidator.isAppleJuiceXml(xmlString)) {
          throw new Error('Not a valid AppleJuice XML format')
        }

        // Vollständige XML-zu-JSON-Konvertierung
        const jsonData = parseXmlToJson(xmlString)

        // Strukturierte Datenextraktion
        const extractedData = {
          generalInfo: DataExtractor.getValues(jsonData, {
            version: ['GENERALINFORMATION.VERSION.VALUES.CDATA', 'Unknown'],
            system: ['GENERALINFORMATION.SYSTEM.VALUES.CDATA', 'Unknown'],
            uptime: ['GENERALINFORMATION.UPTIME.VALUES.CDATA', '0min'],
            nickname: ['GENERALINFORMATION.NICKNAME.VALUES.CDATA', 'AppleJuice Core'],
            comment: ['GENERALINFORMATION.COMMENT.VALUES.CDATA', 'AppleJuice File-Sharing'],
            connections: ['GENERALINFORMATION.CONNECTIONS.VALUES.CDATA', '0'],
            sessionDownload: ['GENERALINFORMATION.SESSIONDOWNLOAD.VALUES.CDATA', '0'],
            sessionUpload: ['GENERALINFORMATION.SESSIONUPLOAD.VALUES.CDATA', '0'],
            powerDownload: ['GENERALINFORMATION.POWERDOWNLOAD.VALUES.CDATA', '0'],
            powerUpload: ['GENERALINFORMATION.POWERUPLOAD.VALUES.CDATA', '0']
          }),
          settings: DataExtractor.getValues(jsonData, {
            maxDownloads: ['SETTINGS.MAXDOWNLOADS.VALUES.CDATA', '0'],
            maxUploads: ['SETTINGS.MAXUPLOADS.VALUES.CDATA', '0'],
            maxConnectionsPerDownload: ['SETTINGS.MAXCONNECTIONSPERDOWNLOAD.VALUES.CDATA', '0'],
            maxSourcesPerFile: ['SETTINGS.MAXSOURCESPERFILE.VALUES.CDATA', '0'],
            downloadSpeed: ['SETTINGS.DOWNLOADSPEED.VALUES.CDATA', '0'],
            uploadSpeed: ['SETTINGS.UPLOADSPEED.VALUES.CDATA', '0']
          }),
          capabilities: DataExtractor.getValues(jsonData, {
            xmlCompression: ['CAPABILITIES.XMLCOMPRESSION.VALUES.CDATA', 'false'],
            partialFileSharing: ['CAPABILITIES.PARTIALFILESHARING.VALUES.CDATA', 'false'],
            firewall: ['CAPABILITIES.FIREWALL.VALUES.CDATA', 'false']
          }),
          rawData: jsonData
        }

        // Core-Daten aktualisieren
        this.updateCoreInfoFromInformation(extractedData)

        console.log('[CORE STORE] Information.xml parsed successfully')
        return extractedData
      } catch (error) {
        console.error('[CORE STORE] Error parsing Information.xml:', error)
        throw new Error(`Failed to parse Information.xml: ${error.message}`)
      }
    },

    /**
     * Modified.xml Parser - Live-Updates und Echtzeitdaten
     */
    parseModifiedXml(xmlString) {
      try {
        console.log('[CORE STORE] Parsing Modified.xml')

        // Spezielle Behandlung für Modified.xml (meist Attribute-basiert)
        const informationMatch = xmlString.match(/<information\s+([^>]+)>/i)
        const networkInfoMatch = xmlString.match(/<networkinfo\s+([^>]+)>/i)
        const welcomeMatch = xmlString.match(/<welcomemessage>\s*(.*?)\s*<\/welcomemessage>/is)
        const serverMatches = xmlString.match(/<server\s+([^>]+)\/>/gi)

        let extractedData = {
          information: {},
          networkInfo: {},
          servers: [],
          welcomeMessage: null,
          rawData: xmlString
        }

        // Information-Attribute extrahieren
        if (informationMatch) {
          extractedData.information = this.parseXmlAttributes(informationMatch[1])
          console.log('[CORE STORE] Extracted information attributes:', extractedData.information)
          
          // Stellen Sie sicher, dass die Download-Informationen vorhanden sind
          if (extractedData.information.downloadcount !== undefined) {
            extractedData.information.downloadCount = extractedData.information.downloadcount
          }
          
          if (extractedData.information.downloadsrunning !== undefined) {
            extractedData.information.downloadsRunning = extractedData.information.downloadsrunning
          }
          console.log('[CORE STORE] Extracted information attributes:', extractedData.information)

          // Stellen Sie sicher, dass die Download-Informationen vorhanden sind
          if (extractedData.information.downloadcount !== undefined) {
            extractedData.information.downloadCount = extractedData.information.downloadcount
          }

          if (extractedData.information.downloadsrunning !== undefined) {
            extractedData.information.downloadsRunning = extractedData.information.downloadsrunning
          }
        }

        // NetworkInfo-Attribute extrahieren
        if (networkInfoMatch) {
          extractedData.networkInfo = this.parseXmlAttributes(networkInfoMatch[1])
        }

        // Willkommensnachricht extrahieren
        if (welcomeMatch) {
          extractedData.welcomeMessage = welcomeMatch[1].trim()
        }

        // Server-Liste extrahieren
        if (serverMatches) {
          extractedData.servers = serverMatches.map(serverMatch => {
            const attributeString = serverMatch.match(/<server\s+([^>]+)\/>/i)[1]
            const attributes = this.parseXmlAttributes(attributeString)

            return {
              id: parseInt(attributes.id) || 0,
              name: attributes.name || 'Unnamed Server',
              host: attributes.host || 'Unknown',
              port: parseInt(attributes.port) || 9855,
              lastseen: parseInt(attributes.lastseen) || 0,
              connectiontry: parseInt(attributes.connectiontry) || 0,
              isOnline: parseInt(attributes.lastseen) > 0,
              lastSeenFormatted: this.formatTimestamp(parseInt(attributes.lastseen))
            }
          })
        }

        // Live-Daten in Core-State aktualisieren
        this.updateCoreInfoFromModified(extractedData)

        console.log('[CORE STORE] Modified.xml parsed successfully')
        return extractedData
      } catch (error) {
        console.error('[CORE STORE] Error parsing Modified.xml:', error)
        throw new Error(`Failed to parse Modified.xml: ${error.message}`)
      }
    },

    /**
     * Shared.xml Parser - Geteilte Dateien und Verzeichnisse
     */
    parseSharedXml(xmlString) {
      try {
        console.log('[CORE STORE] Parsing Shared.xml')

        // Validierung der XML-Struktur
        if (!XmlValidator.isValidXml(xmlString)) {
          throw new Error('Invalid XML structure in Shared.xml')
        }

        // Vollständige XML-zu-JSON-Konvertierung
        const jsonData = parseXmlToJson(xmlString)

        let extractedData = {
          shares: [],
          directories: [],
          statistics: {
            totalFiles: 0,
            totalSize: 0,
            totalDirectories: 0
          },
          rawData: jsonData
        }

        // Shared-Dateien extrahieren
        if (jsonData.SHARED) {
          const sharedData = jsonData.SHARED

          // Dateien verarbeiten
          if (sharedData.SHARE) {
            const shares = Array.isArray(sharedData.SHARE) ? sharedData.SHARE : [sharedData.SHARE]

            extractedData.shares = shares.map(share => {
              const attributes = share.ATTRIBUTES || {}

              return {
                id: attributes.id || '',
                filename: attributes.filename || 'Unknown',
                size: parseInt(attributes.size) || 0,
                sizeFormatted: this.formatBytes(parseInt(attributes.size) || 0),
                checksum: attributes.checksum || '',
                priority: parseInt(attributes.priority) || 0,
                lastmodified: parseInt(attributes.lastmodified) || 0,
                lastmodifiedFormatted: this.formatTimestamp(parseInt(attributes.lastmodified) || 0),
                directory: attributes.directory || '',
                type: this.getFileType(attributes.filename || ''),
                extension: this.getFileExtension(attributes.filename || '')
              }
            })
          }

          // Verzeichnisse verarbeiten
          if (sharedData.DIRECTORY) {
            const directories = Array.isArray(sharedData.DIRECTORY) ? sharedData.DIRECTORY : [sharedData.DIRECTORY]

            extractedData.directories = directories.map(dir => {
              const attributes = dir.ATTRIBUTES || {}

              return {
                id: attributes.id || '',
                name: attributes.name || 'Unknown',
                path: attributes.path || '',
                filecount: parseInt(attributes.filecount) || 0,
                size: parseInt(attributes.size) || 0,
                sizeFormatted: this.formatBytes(parseInt(attributes.size) || 0),
                lastmodified: parseInt(attributes.lastmodified) || 0,
                lastmodifiedFormatted: this.formatTimestamp(parseInt(attributes.lastmodified) || 0)
              }
            })
          }
        }

        // Statistiken berechnen
        extractedData.statistics.totalFiles = extractedData.shares.length
        extractedData.statistics.totalDirectories = extractedData.directories.length
        extractedData.statistics.totalSize = extractedData.shares.reduce((sum, share) => sum + share.size, 0)

        // Share-Statistiken in Core-State aktualisieren
        this.updateShareStatistics(extractedData.statistics)

        console.log('[CORE STORE] Shared.xml parsed successfully')
        return extractedData
      } catch (error) {
        console.error('[CORE STORE] Error parsing Shared.xml:', error)
        throw new Error(`Failed to parse Shared.xml: ${error.message}`)
      }
    },

    /**
     * XML-Attribute Parser Hilfsfunktion
     */
    parseXmlAttributes(attributeString) {
      const attributes = {}
      const regex = /(\w+)="([^"]*)"/g
      let match

      while ((match = regex.exec(attributeString)) !== null) {
        attributes[match[1]] = match[2]
      }

      return attributes
    },

    /**
     * Core-Info aus Information.xml aktualisieren
     */
    updateCoreInfoFromInformation(data) {
      if (data.generalInfo) {
        this.coreData.coreInfo.version = data.generalInfo.version || this.coreData.coreInfo.version
        this.coreData.coreInfo.os = data.generalInfo.system || this.coreData.coreInfo.os
        this.coreData.coreInfo.uptime = data.generalInfo.uptime || this.coreData.coreInfo.uptime
        this.coreData.coreInfo.connections = parseInt(data.generalInfo.connections) || 0
        this.coreData.coreInfo.bytesIn = this.formatBytes(parseInt(data.generalInfo.sessionDownload) || 0)
        this.coreData.coreInfo.bytesOut = this.formatBytes(parseInt(data.generalInfo.sessionUpload) || 0)

        // Server-Info aktualisieren
        this.coreData.server.name = data.generalInfo.nickname || this.coreData.server.name
        this.coreData.server.description = data.generalInfo.comment || this.coreData.server.description
      }
    },

    /**
     * Core-Info aus Modified.xml aktualisieren (Live-Daten)
     */
    updateCoreInfoFromModified(data) {
      if (data.information) {
        const info = data.information
        console.log('[CORE STORE] Updating from modified.xml information:', info)

        // Live-Verbindungen
        if (info.openconnections) {
          this.coreData.coreInfo.connections = parseInt(info.openconnections) || 0
        }
        
        // Downloads
        if (info.downloadcount !== undefined) {
          this.coreData.statistics.downloads.total = parseInt(info.downloadcount) || 0
          console.log('[CORE STORE] Updated download count:', this.coreData.statistics.downloads.total)
        }
        
        if (info.downloadsrunning !== undefined) {
          this.coreData.statistics.downloads.active = parseInt(info.downloadsrunning) || 0
          console.log('[CORE STORE] Updated active downloads:', this.coreData.statistics.downloads.active)
        }
        
        // Uploads
        if (info.uploadcount !== undefined) {
          this.coreData.statistics.uploads.active = parseInt(info.uploadcount) || 0
          console.log('[CORE STORE] Updated active uploads:', this.coreData.statistics.uploads.active)
        }

        // Live-Geschwindigkeiten
        if (info.downloadspeed) {
          this.coreData.coreInfo.downloadSpeed = this.formatBytes(parseInt(info.downloadspeed)) + '/s'
          this.coreData.networkInfo.download = this.formatBytes(parseInt(info.downloadspeed)) + '/s'
        }
        if (info.uploadspeed) {
          this.coreData.coreInfo.uploadSpeed = this.formatBytes(parseInt(info.uploadspeed)) + '/s'
          this.coreData.networkInfo.upload = this.formatBytes(parseInt(info.uploadspeed)) + '/s'
        }

        // Credits
        if (info.credits) {
          const credits = parseInt(info.credits)
          this.coreData.statistics.credits = this.formatBytes(Math.abs(credits)) + (credits < 0 ? ' (Schulden)' : '')
        }

        // Downloads
        if (info.downloadcount !== undefined) {
          this.coreData.statistics.downloads.total = parseInt(info.downloadcount) || 0
          console.log('[CORE STORE] Updated download count:', this.coreData.statistics.downloads.total)
        }

        if (info.downloadsrunning !== undefined) {
          this.coreData.statistics.downloads.active = parseInt(info.downloadsrunning) || 0
          console.log('[CORE STORE] Updated active downloads:', this.coreData.statistics.downloads.active)
        }

        // Uploads
        if (info.uploadcount !== undefined) {
          this.coreData.statistics.uploads.active = parseInt(info.uploadcount) || 0
          console.log('[CORE STORE] Updated active uploads:', this.coreData.statistics.uploads.active)
        }
      }

      if (data.networkInfo) {
        const netInfo = data.networkInfo

        if (netInfo.users) {
          this.coreData.networkInfo.sharedUsers = parseInt(netInfo.users) || 0
        }
        if (netInfo.files) {
          this.coreData.networkInfo.totalFiles = parseInt(netInfo.files).toLocaleString('de-DE')
        }
        if (netInfo.filesize) {
          this.coreData.networkInfo.totalSize = this.formatBytes(parseFloat(netInfo.filesize) * 1024 * 1024)
        }
        if (netInfo.ip) {
          this.coreData.networkInfo.serverIp = netInfo.ip
        }
        if (netInfo.firewalled) {
          this.coreData.networkInfo.firewalled = netInfo.firewalled === 'true'
        }
      }

      if (data.welcomeMessage) {
        this.coreData.networkInfo.welcomeMessage = data.welcomeMessage.replace(/<[^>]*>/g, '')
      }

      if (data.servers) {
        this.coreData.networkInfo.servers = data.servers
      }
    },

    /**
     * Share-Statistiken aktualisieren
     */
    updateShareStatistics(statistics) {
      this.coreData.statistics.shares.count = statistics.totalFiles
      this.coreData.statistics.shares.size = this.formatBytes(statistics.totalSize)
    },

    /**
     * Bytes formatieren
     */
    formatBytes(bytes) {
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
      if (bytes === 0) return '0 B'
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      const value = bytes / Math.pow(1024, i)
      return `${value.toFixed(2)} ${sizes[i]}`
    },

    /**
     * Timestamp formatieren
     */
    formatTimestamp(timestamp) {
      if (!timestamp || timestamp === 0) {
        return 'Nie'
      }

      try {
        const date = new Date(timestamp)
        return date.toLocaleString('de-DE')
      } catch (error) {
        return 'Unbekannt'
      }
    },

    /**
     * Dateityp ermitteln
     */
    getFileType(filename) {
      const extension = this.getFileExtension(filename).toLowerCase()

      const typeMap = {
        // Videos
        'mp4': 'video', 'avi': 'video', 'mkv': 'video', 'wmv': 'video', 'mov': 'video', 'flv': 'video',
        // Audio
        'mp3': 'audio', 'flac': 'audio', 'wav': 'audio', 'ogg': 'audio', 'aac': 'audio', 'wma': 'audio',
        // Images
        'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image', 'bmp': 'image', 'svg': 'image',
        // Archives
        'zip': 'archive', 'rar': 'archive', '7z': 'archive', 'tar': 'archive', 'gz': 'archive',
        // Documents
        'pdf': 'document', 'doc': 'document', 'docx': 'document', 'txt': 'document', 'rtf': 'document',
        // Executables
        'exe': 'executable', 'msi': 'executable', 'deb': 'executable', 'rpm': 'executable'
      }

      return typeMap[extension] || 'unknown'
    },

    /**
     * Dateierweiterung extrahieren
     */
    getFileExtension(filename) {
      const parts = filename.split('.')
      return parts.length > 1 ? parts[parts.length - 1] : ''
    },

    /**
     * Erweiterte XML-Daten laden und parsen
     */
    async loadAndParseXmlData(xmlType) {
      try {
        this.isLoading = true
        const xmlString = await coreService.command('xml', `${xmlType}.xml`)

        let parsedData = null

        switch (xmlType) {
          case 'information':
            parsedData = this.parseInformationXml(xmlString)
            this.rawData.information = parsedData
            break
          case 'modified':
            parsedData = this.parseModifiedXml(xmlString)
            this.rawData.modified = parsedData
            break
          case 'shared':
            parsedData = this.parseSharedXml(xmlString)
            this.rawData.shared = parsedData
            break
          default:
            throw new Error(`Unknown XML type: ${xmlType}`)
        }

        this.lastUpdate = new Date().toISOString()
        return parsedData
      } catch (error) {
        console.error(`[CORE STORE] Error loading ${xmlType}.xml:`, error)
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})
