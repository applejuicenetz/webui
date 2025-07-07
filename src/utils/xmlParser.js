/**
 * XML Parser Utilities
 * Erweiterte XML-zu-JSON-Konvertierung für AppleJuice Core
 */

/**
 * Erweiterte XML-zu-JSON-Konvertierung mit besserer Fehlerbehandlung
 * @param {string} xmlString - XML-String vom AppleJuice Core
 * @returns {Object} - Konvertiertes JSON-Objekt
 */
export function parseXmlToJson(xmlString) {
  try {
    // Prüfung ob es sich um HTML handelt (häufiger Fehler bei AppleJuice Core)
    if (xmlString.includes('<html>') || xmlString.includes('<head>') || xmlString.includes('<!DOCTYPE')) {
      console.warn('Received HTML instead of XML from AppleJuice Core')
      console.warn('Response preview:', xmlString.substring(0, 300))
      throw new Error('Server returned HTML instead of XML (possibly wrong password or endpoint)')
    }

    // Prüfung auf JSON-Antworten (Proxy-Fehler)
    if (xmlString.trim().startsWith('{') && xmlString.trim().endsWith('}')) {
      console.warn('Received JSON instead of XML from proxy')
      console.warn('Response preview:', xmlString.substring(0, 300))

      try {
        const jsonError = JSON.parse(xmlString)
        if (jsonError.code === 'WRONG_PASSWORD') {
          throw new Error('Authentication failed: Wrong password')
        }
        throw new Error(`Proxy Error: ${jsonError.message || jsonError.error || 'Unknown error'}`)
      } catch (parseError) {
        throw new Error('Server returned JSON instead of XML (proxy error)')
      }
    }

    // Prüfung auf HTTP-Redirect-Antworten (falsches Passwort)
    if (xmlString.includes('HTTP/1.1 302') || xmlString.includes('location: /wrongpassword')) {
      console.warn('Received HTTP redirect - wrong password')
      console.warn('Response preview:', xmlString.substring(0, 300))
      throw new Error('Authentication failed: Wrong password')
    }

    // Bereinigung der XML-Daten
    const cleanXml = cleanXmlString(xmlString)

    // Prüfung auf leere oder ungültige Responses
    if (!cleanXml || cleanXml.length < 10) {
      throw new Error('Empty or invalid XML response')
    }

    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(cleanXml, 'text/xml')

    // Prüfung auf Parser-Fehler
    const parseError = xmlDoc.getElementsByTagName('parsererror')[0]
    if (parseError) {
      const errorText = parseError.textContent || parseError.innerText || 'Unknown XML parse error'
      throw new Error(`XML Parse Error: ${errorText}`)
    }

    // Prüfung auf gültiges Root-Element
    if (!xmlDoc.documentElement || xmlDoc.documentElement.tagName === 'parsererror') {
      throw new Error('Invalid XML structure: No valid root element')
    }

    return xmlNodeToJson(xmlDoc.documentElement)
  } catch (error) {
    console.error('XML Parser Error:', error)
    console.error('XML String preview:', xmlString.substring(0, 200) + '...')
    throw new Error(`Failed to parse XML: ${error.message}`)
  }
}

/**
 * XML-String bereinigen
 * @param {string} xmlString - Ursprünglicher XML-String
 * @returns {string} - Bereinigter XML-String
 */
function cleanXmlString(xmlString) {
  return xmlString
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Entfernt Steuerzeichen
    .replace(/&(?!amp;|lt;|gt;|quot;|apos;)/g, '&amp;') // Escaped ungültige &-Zeichen
    .replace(/\r\n/g, '\n') // Normalisiert Zeilenumbrüche
    .trim()
}

/**
 * XML-Node zu JSON konvertieren (rekursiv)
 * @param {Node} node - XML-Node
 * @returns {Object} - JSON-Objekt
 */
function xmlNodeToJson(node) {
  const result = {}

  // Attribute verarbeiten
  if (node.attributes && node.attributes.length > 0) {
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i]
      result[attr.name] = attr.value
    }
  }

  // Child-Nodes verarbeiten
  if (node.childNodes && node.childNodes.length > 0) {
    const textContent = getTextContent(node)

    if (textContent && !hasElementChildren(node)) {
      // Nur Text-Content
      result.CDATA = textContent
    } else {
      // Element-Children verarbeiten
      for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i]

        if (child.nodeType === Node.ELEMENT_NODE) {
          const childName = child.nodeName
          const childJson = xmlNodeToJson(child)

          // Gruppierung nach erstem Attribut (wie in PHP-Implementation)
          if (child.attributes && child.attributes.length > 0) {
            const groupKey = child.attributes[0].value

            if (!result[childName]) {
              result[childName] = {}
            }
            result[childName][groupKey] = childJson
          } else {
            // Keine Attribute - unter VALUES gruppieren
            if (!result[childName]) {
              result[childName] = {}
            }
            result[childName].VALUES = childJson
          }
        }
      }
    }
  }

  return result
}

/**
 * Text-Content aus Node extrahieren
 * @param {Node} node - XML-Node
 * @returns {string} - Text-Content
 */
function getTextContent(node) {
  let textContent = ''

  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i]
    if (child.nodeType === Node.TEXT_NODE || child.nodeType === Node.CDATA_SECTION_NODE) {
      textContent += child.nodeValue
    }
  }

  return textContent.trim()
}

/**
 * Prüft, ob Node Element-Children hat
 * @param {Node} node - XML-Node
 * @returns {boolean} - Hat Element-Children
 */
function hasElementChildren(node) {
  for (let i = 0; i < node.childNodes.length; i++) {
    if (node.childNodes[i].nodeType === Node.ELEMENT_NODE) {
      return true
    }
  }
  return false
}

/**
 * Spezielle Parser für AppleJuice Core XML-Strukturen
 */
export const AJXmlParser = {
  /**
   * Information.xml parsen
   * @param {string} xmlString - XML-String
   * @returns {Object} - Geparste Informationen
   */
  parseInformation(xmlString) {
    const json = parseXmlToJson(xmlString)

    return {
      generalInfo: json.GENERALINFORMATION || {},
      settings: json.SETTINGS || {},
      capabilities: json.CAPABILITIES || {}
    }
  },

  /**
   * Downloads.xml parsen
   * @param {string} xmlString - XML-String
   * @returns {Object} - Geparste Download-Informationen
   */
  parseDownloads(xmlString) {
    const json = parseXmlToJson(xmlString)

    return {
      downloads: json.DOWNLOADS || {},
      information: json.INFORMATION || {}
    }
  },

  /**
   * Uploads.xml parsen
   * @param {string} xmlString - XML-String
   * @returns {Object} - Geparste Upload-Informationen
   */
  parseUploads(xmlString) {
    const json = parseXmlToJson(xmlString)

    return {
      uploads: json.UPLOADS || {},
      information: json.INFORMATION || {}
    }
  },

  /**
   * Shared.xml parsen
   * @param {string} xmlString - XML-String
   * @returns {Object} - Geparste Share-Informationen
   */
  parseShared(xmlString) {
    const json = parseXmlToJson(xmlString)

    return {
      shared: json.SHARED || {},
      information: json.INFORMATION || {}
    }
  },

  /**
   * Server.xml parsen
   * @param {string} xmlString - XML-String
   * @returns {Object} - Geparste Server-Informationen
   */
  parseServer(xmlString) {
    const json = parseXmlToJson(xmlString)

    return {
      serverInfo: json.SERVERINFO || {},
      settings: json.SETTINGS || {}
    }
  },

  /**
   * Network.xml parsen
   * @param {string} xmlString - XML-String
   * @returns {Object} - Geparste Netzwerk-Informationen
   */
  parseNetwork(xmlString) {
    const json = parseXmlToJson(xmlString)

    return {
      network: json.NETWORK || {},
      statistics: json.STATISTICS || {}
    }
  }
}

/**
 * Datenextraktor für spezifische Werte
 */
export const DataExtractor = {
  /**
   * Sicherer Wert-Extraktor
   * @param {Object} obj - Objekt
   * @param {string} path - Pfad (z.B. 'GENERALINFORMATION.VERSION.VALUES.CDATA')
   * @param {*} defaultValue - Standardwert
   * @returns {*} - Extrahierter Wert
   */
  getValue(obj, path, defaultValue = null) {
    try {
      return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : defaultValue
      }, obj)
    } catch (error) {
      console.warn(`DataExtractor: Could not extract value from path ${path}`, error)
      return defaultValue
    }
  },

  /**
   * Mehrere Werte extrahieren
   * @param {Object} obj - Objekt
   * @param {Object} paths - Pfade-Objekt
   * @returns {Object} - Extrahierte Werte
   */
  getValues(obj, paths) {
    const result = {}

    Object.entries(paths).forEach(([key, path]) => {
      if (typeof path === 'string') {
        result[key] = this.getValue(obj, path)
      } else if (Array.isArray(path)) {
        result[key] = this.getValue(obj, path[0], path[1])
      }
    })

    return result
  }
}

/**
 * Validierung für XML-Daten
 */
export const XmlValidator = {
  /**
   * Prüft ob XML-String gültig ist
   * @param {string} xmlString - XML-String
   * @returns {boolean} - Ist gültig
   */
  isValidXml(xmlString) {
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
      return xmlDoc.getElementsByTagName('parsererror').length === 0
    } catch (error) {
      return false
    }
  },

  /**
   * Prüft ob XML AppleJuice-Core-Format hat
   * @param {string} xmlString - XML-String
   * @returns {boolean} - Ist AppleJuice-Format
   */
  isAppleJuiceXml(xmlString) {
    const commonElements = [
      'GENERALINFORMATION',
      'DOWNLOADS',
      'UPLOADS',
      'SHARED',
      'SERVERINFO',
      'NETWORK'
    ]

    return commonElements.some(element => xmlString.includes(`<${element}`))
  }
}
