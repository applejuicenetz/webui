import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { hashPassword, isMD5Hash } from '@/utils/crypto'
import { config } from '@/utils/config'

export const useAuthStore = defineStore('auth', () => {
  // State
  const isAuthenticated = ref(false)
  const coreUrl = ref('')
  const port = ref('')
  const password = ref('')
  const connectionError = ref('')
  const isLoading = ref(false)

  // Getters
  const getConnectionUrl = computed(() => {
    if (!coreUrl.value || !port.value) return ''
    return `http://${coreUrl.value}:${port.value}`
  })

  const getFullUrl = computed(() => {
    if (!getConnectionUrl.value || !password.value) return ''
    return `${getConnectionUrl.value}/settings.xml?password=${password.value}`
  })

  // Helper function to ensure password is hashed
  const ensureHashedPassword = (pass) => {
    if (!pass) return ''
    // Wenn das Passwort bereits ein MD5-Hash ist, verwende es direkt
    if (isMD5Hash(pass)) {
      return pass
    }
    // Andernfalls hashe das Passwort
    return hashPassword(pass)
  }

  // Actions
  const checkConnection = async (url, portNum, pass) => {
    isLoading.value = true
    connectionError.value = ''

    try {
      // Passwort hashen bevor es verwendet wird
      const hashedPassword = ensureHashedPassword(pass)

      // Always use proxy endpoint - server handles the proxy
      const fullUrl = `/api/settings.xml?password=${hashedPassword}`

      // Prepare headers
      const headers = {
        'Accept': 'application/xml, text/xml, */*',
        'Cache-Control': 'no-cache'
      }

      // Verbindung testen
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers,
        // Timeout aus Konfiguration
        signal: AbortSignal.timeout(config.core.timeout)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Prüfen ob es wirklich eine XML-Datei ist
      const contentType = response.headers.get('content-type')
      const responseText = await response.text()

      if (!responseText || responseText.trim() === '') {
        throw new Error('Leere Antwort vom Server')
      }

      // Einfache XML-Validierung
      if (!responseText.includes('<?xml') && !responseText.includes('<settings')) {
        throw new Error('Ungültige XML-Antwort')
      }

      // Verbindung erfolgreich - Daten speichern (Passwort wird gehasht gespeichert)
      coreUrl.value = url
      port.value = portNum
      password.value = hashedPassword
      isAuthenticated.value = true

      // In localStorage persistieren
      saveToLocalStorage()

      return true

    } catch (error) {
      console.error('Verbindungsfehler:', error)

      if (error.name === 'TimeoutError') {
        connectionError.value = 'Verbindung ist zu langsam (Timeout nach 10s)'
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        connectionError.value = 'Keine Verbindung möglich. Prüfen Sie URL und Port.'
      } else if (error.message.includes('HTTP')) {
        connectionError.value = `Serverfehler: ${error.message}`
      } else {
        connectionError.value = 'Keine Verbindung hergestellt. Bitte überprüfen Sie Ihre Eingaben.'
      }

      throw error
    } finally {
      isLoading.value = false
    }
  }

  const login = async (loginData) => {
    const { coreUrl: url, port: portNum, password: pass } = loginData

    if (!url || !portNum || !pass) {
      connectionError.value = 'Bitte füllen Sie alle Felder aus.'
      return false
    }

    try {
      await checkConnection(url, portNum, pass)
      return true
    } catch (error) {
      return false
    }
  }

  const logout = () => {
    isAuthenticated.value = false
    coreUrl.value = ''
    port.value = ''
    password.value = ''
    connectionError.value = ''

    // Aus localStorage entfernen
    localStorage.removeItem(config.app.storageKey)
  }

  const saveToLocalStorage = () => {
    const authData = {
      isAuthenticated: isAuthenticated.value,
      coreUrl: coreUrl.value,
      port: port.value,
      password: password.value,
      timestamp: Date.now()
    }

    localStorage.setItem(config.app.storageKey, JSON.stringify(authData))
  }

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(config.app.storageKey)
      if (!stored) return false

      const authData = JSON.parse(stored)

      // Prüfen ob die Daten nicht älter als 24 Stunden sind
      const isExpired = Date.now() - authData.timestamp > 24 * 60 * 60 * 1000
      if (isExpired) {
        localStorage.removeItem(config.app.storageKey)
        return false
      }

      // Daten wiederherstellen
      isAuthenticated.value = authData.isAuthenticated || false
      coreUrl.value = authData.coreUrl || ''
      port.value = authData.port || ''
      password.value = authData.password || ''

      return true
    } catch (error) {
      console.error('Fehler beim Laden der gespeicherten Auth-Daten:', error)
      localStorage.removeItem(config.app.storageKey)
      return false
    }
  }

  const testStoredConnection = async () => {
    if (!isAuthenticated.value || !coreUrl.value || !port.value || !password.value) {
      return false
    }

    try {
      await checkConnection(coreUrl.value, port.value, password.value)
      return true
    } catch (error) {
      // Bei Fehler ausloggen
      logout()
      return false
    }
  }

  // Beim Store-Init gespeicherte Daten laden
  loadFromLocalStorage()

  return {
    // State
    isAuthenticated,
    coreUrl,
    port,
    password,
    connectionError,
    isLoading,

    // Getters
    getConnectionUrl,
    getFullUrl,

    // Actions
    login,
    logout,
    checkConnection,
    loadFromLocalStorage,
    testStoredConnection
  }
})
