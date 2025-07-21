import { useAuthStore } from '@/stores/auth'

/**
 * API Utility für Anfragen an den AppleJuice Core Server über den Proxy
 */

export interface ApiResponse {
  success: boolean
  data?: any
  error?: string
}

/**
 * Lädt XML-Daten vom Core Server
 * @param file - Dateiname (z.B. 'settings.xml', 'information.xml')
 * @returns Promise mit XML-Inhalt als String
 */
export async function loadXmlData(file: string, retryCount: number = 0): Promise<string> {
  const authStore = useAuthStore()
  
  if (!authStore.isAuthenticated) {
    throw new Error('Nicht angemeldet')
  }

  try {
    const response = await authStore.makeProxyRequest('xml', file)
    
    // Prüfe ob die Antwort wie XML aussieht
    if (!response || typeof response !== 'string') {
      throw new Error(`Ungültige Antwort für ${file}: Keine Daten erhalten`)
    }
    
    const trimmedResponse = response.trim()
    if (trimmedResponse.length === 0) {
      throw new Error(`Ungültige Antwort für ${file}: Leere Antwort`)
    }
    
    // Prüfe ob es mit < anfängt (XML-Start)
    if (!trimmedResponse.startsWith('<')) {
      console.error(`Ungültige XML-Antwort für ${file}:`, trimmedResponse.substring(0, 200))
      throw new Error(`Ungültige Antwort für ${file}: Kein gültiges XML (beginnt mit: "${trimmedResponse.substring(0, 50)}")`)
    }
    
    return trimmedResponse
  } catch (error) {
    console.error(`Fehler beim Laden von ${file}:`, error)
    
    // Retry-Logik für Session-Probleme
    if (error instanceof Error && error.message.includes('Session abgelaufen') && retryCount < 2) {
      console.log(`Retry attempt ${retryCount + 1} for ${file} after session error`)
      
      // Warte kurz und versuche es erneut
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Prüfe Auth-Status erneut
      await authStore.checkAuthStatus()
      
      if (authStore.isAuthenticated) {
        return loadXmlData(file, retryCount + 1)
      }
    }
    
    throw error
  }
}

/**
 * Lädt Informationen vom Core Server
 * @param file - Dateiname (z.B. 'information.xml')
 * @returns Promise mit XML-Inhalt als String
 */
export async function loadInformation(file: string = 'information.xml'): Promise<string> {
  return await loadXmlData(file)
}

/**
 * Lädt Einstellungen vom Core Server
 * @returns Promise mit XML-Inhalt als String
 */
export async function loadSettings(): Promise<string> {
  return await loadXmlData('settings.xml')
}

/**
 * Lädt Downloads-Liste vom Core Server
 * @returns Promise mit XML-Inhalt als String
 */
export async function loadDownloads(): Promise<string> {
  return await loadXmlData('downloads.xml')
}

/**
 * Lädt Uploads-Liste vom Core Server
 * @returns Promise mit XML-Inhalt als String
 */
export async function loadUploads(): Promise<string> {
  return await loadXmlData('uploads.xml')
}

/**
 * Lädt Server-Liste vom Core Server
 * @returns Promise mit XML-Inhalt als String
 */
export async function loadServers(): Promise<string> {
  return await loadXmlData('server.xml')
}

/**
 * Lädt Share-Liste vom Core Server
 * @returns Promise mit XML-Inhalt als String
 */
export async function loadShares(): Promise<string> {
  return await loadXmlData('share.xml')
}

/**
 * Lädt Änderungen-Liste vom Core Server
 * @returns Promise mit XML-Inhalt als String
 */
export async function loadModified(): Promise<string> {
  return await loadXmlData('modified.xml')
}

/**
 * Lädt alle wichtigen XML-Dateien gleichzeitig
 * @returns Promise mit Objekt aller XML-Inhalte
 */
export async function loadAllXmlData(): Promise<{
  settings: string,
  information: string,
  modified: string,
  share: string
}> {
  try {
    const [settings, information, modified, share] = await Promise.all([
      loadSettings(),
      loadInformation(),
      loadModified(),
      loadShares()
    ])

    return {
      settings,
      information,
      modified,
      share
    }
  } catch (error) {
    console.error('Fehler beim Laden der XML-Dateien:', error)
    throw error
  }
}

/**
 * Lädt alle wichtigen XML-Dateien und parst sie gleichzeitig
 * @returns Promise mit Objekt aller geparsten XML-Dokumente
 */
export async function loadAndParseAllXml(): Promise<{
  settings: Document,
  information: Document,
  modified: Document,
  share: Document
}> {
  const xmlData = await loadAllXmlData()

  const results: any = {}
  const errors: string[] = []

  // Parse jede XML-Datei einzeln mit Fehlerbehandlung
  for (const [key, xmlContent] of Object.entries(xmlData)) {
    try {
      results[key] = parseXml(xmlContent)
    } catch (error) {
      console.error(`Fehler beim Parsen von ${key}.xml:`, error)
      errors.push(`${key}: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`)
      
      // Erstelle ein leeres XML-Dokument als Fallback
      results[key] = new DOMParser().parseFromString('<root></root>', 'text/xml')
    }
  }

  if (errors.length > 0) {
    console.warn('XML-Parse-Warnungen:', errors)
  }

  return results
}

/**
 * Sendet einen Befehl an den Core Server
 * @param type - Command-Typ (z.B. 'function')
 * @param command - Befehl (z.B. 'connect', 'disconnect')
 * @param params - Zusätzliche Parameter
 * @returns Promise mit Antwort als String
 */
export async function sendCommand(type: string, command: string, params: Record<string, any> = {}): Promise<string> {
  const authStore = useAuthStore()
  
  if (!authStore.isAuthenticated) {
    throw new Error('Nicht angemeldet')
  }

  return await authStore.makeProxyRequest(type, command, 'POST', params)
}

/**
 * Parst XML-String zu JavaScript-Objekt
 * @param xmlString - XML-String
 * @returns Parsed XML als DOM-Objekt
 */
export function parseXml(xmlString: string): Document {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
  
  // Prüfe auf Parser-Fehler
  const parseError = xmlDoc.querySelector('parsererror')
  if (parseError) {
    throw new Error(`XML Parse Error: ${parseError.textContent}`)
  }
  
  return xmlDoc
}

/**
 * Extrahiert spezifische Werte aus XML
 * @param xmlDoc - XML Document
 * @param selector - CSS-Selector für Element
 * @returns Text-Inhalt des Elements
 */
export function getXmlValue(xmlDoc: Document, selector: string): string | null {
  const element = xmlDoc.querySelector(selector)
  return element ? element.textContent : null
}

/**
 * Extrahiert alle Elemente mit einem spezifischen Tag
 * @param xmlDoc - XML Document
 * @param tagName - Tag-Name
 * @returns Array von Elementen
 */
export function getXmlElements(xmlDoc: Document, tagName: string): Element[] {
  return Array.from(xmlDoc.getElementsByTagName(tagName))
}

/**
 * Hilfsfunktion zum Formatieren von Bytes
 * @param bytes - Anzahl Bytes
 * @param decimals - Anzahl Dezimalstellen
 * @returns Formatierte Größe (z.B. "1.5 MB")
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Hilfsfunktion zum Formatieren von Geschwindigkeit
 * @param bytesPerSecond - Bytes pro Sekunde
 * @returns Formatierte Geschwindigkeit (z.B. "1.5 MB/s")
 */
export function formatSpeed(bytesPerSecond: number): string {
  return formatBytes(bytesPerSecond) + '/s'
}

/**
 * Hilfsfunktion zum Formatieren von Zeit
 * @param seconds - Sekunden
 * @returns Formatierte Zeit (z.B. "1h 30m 45s")
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  }
  
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.round(seconds % 60)
  
  if (hours < 24) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  }
  
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  return `${days}d ${remainingHours}h ${minutes}m`
}