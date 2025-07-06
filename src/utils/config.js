/**
 * Zentrale Konfiguration für AppleJuice neXus
 * Verwaltet Umgebungsvariablen und Standardwerte
 */

/**
 * Ermittelt automatisch den Host aus der aktuellen URL
 * @returns {string} - Host aus der Browser-URL
 */
export function getAutoHost() {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.hostname
  }
  return 'localhost'
}

export const config = {
  // Core-Verbindung
  core: {
    host: import.meta.env.VITE_AJ_CORE_HOST || getAutoHost(),
    port: import.meta.env.VITE_AJ_CORE_PORT || '9851',
    protocol: import.meta.env.VITE_AJ_CORE_PROTOCOL || 'http',
    timeout: parseInt(import.meta.env.VITE_AJ_CONNECTION_TIMEOUT) || 10000
  },

  // Anwendungseinstellungen
  app: {
    name: 'AppleJuice neXus',
    version: '1.0.0',
    storageKey: 'aj-nexus-auth'
  }
}

/**
 * Erstellt eine vollständige Core-URL
 * @param {string} host - Host/IP-Adresse
 * @param {string} port - Port-Nummer
 * @param {string} protocol - Protokoll (http/https)
 * @returns {string} - Vollständige URL
 */
export function buildCoreUrl(host = config.core.host, port = config.core.port, protocol = config.core.protocol) {
  return `${protocol}://${host}:${port}`
}

/**
 * Erstellt eine Settings-XML URL mit Passwort
 * @param {string} host - Host/IP-Adresse
 * @param {string} port - Port-Nummer
 * @param {string} password - MD5-gehashtes Passwort
 * @param {string} protocol - Protokoll (http/https)
 * @returns {string} - Vollständige Settings-URL
 */
export function buildSettingsUrl(host, port, password, protocol = config.core.protocol) {
  const baseUrl = buildCoreUrl(host, port, protocol)
  return `${baseUrl}/settings.xml?password=${password}`
}

/**
 * Validiert Core-Verbindungsparameter
 * @param {string} host - Host/IP-Adresse
 * @param {string} port - Port-Nummer
 * @returns {Object} - Validierungsergebnis
 */
export function validateCoreConfig(host, port) {
  const errors = {}

  if (!host || host.trim() === '') {
    errors.host = 'Host/IP-Adresse ist erforderlich'
  }

  if (!port || isNaN(parseInt(port)) || parseInt(port) < 1 || parseInt(port) > 65535) {
    errors.port = 'Port muss eine Zahl zwischen 1 und 65535 sein'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
