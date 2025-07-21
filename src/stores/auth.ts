import { defineStore } from 'pinia'
import { ref } from 'vue'
import Swal from 'sweetalert2'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const coreHost = ref('')
  const corePort = ref('')

  // Check authentication status on app start
  const checkAuthStatus = async () => {
    try {
      console.log('Checking authentication status...')
      
      // Prüfe zuerst den Server-Session-Status
      const response = await fetch('/api/auth-status', {
        method: 'GET',
        credentials: 'include' // Wichtig für Session-Cookies
      })
      
      console.log('Auth status response:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Auth status data:', data)
        
        if (data.authenticated) {
          isAuthenticated.value = true
          coreHost.value = data.coreHost
          corePort.value = data.corePort
          console.log('Authentication status restored from server session')
          return
        }
      }
      
      // Fallback: localStorage (für Entwicklung und Session-Recovery)
      const savedHost = localStorage.getItem('aj_core_host')
      const savedPort = localStorage.getItem('aj_core_port')
      const savedAuth = localStorage.getItem('aj_authenticated')
      
      console.log('LocalStorage fallback check:', {
        savedAuth,
        savedHost,
        savedPort
      })
      
      if (savedAuth === 'true' && savedHost && savedPort) {
        // Versuche eine Test-Anfrage um zu prüfen ob die Credentials noch gültig sind
        try {
          console.log('Attempting to restore session from localStorage...')
          
          // Setze temporär die Werte
          isAuthenticated.value = true
          coreHost.value = savedHost
          corePort.value = savedPort
          
          // Teste mit einer einfachen Anfrage
          await makeProxyRequest('xml', 'information.xml')
          
          console.log('Session successfully restored from localStorage')
        } catch (testError) {
          console.error('Session restoration failed:', testError)
          
          // Bereinige ungültige localStorage-Daten
          localStorage.removeItem('aj_authenticated')
          localStorage.removeItem('aj_core_host')
          localStorage.removeItem('aj_core_port')
          
          // Setze Auth-Status zurück
          isAuthenticated.value = false
          coreHost.value = ''
          corePort.value = ''
        }
      }
    } catch (error) {
      console.error('Auth status check error:', error)
    }
  }

  const login = async (fullUrl: string, password: string): Promise<boolean> => {
    try {
      // Parse URL to extract host and port
      const urlParts = fullUrl.replace(/^https?:\/\//, '').split(':')
      const host = urlParts[0]
      const port = urlParts[1] || '9851'

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Wichtig für Session-Cookies
        body: JSON.stringify({
          core_host: host,
          core_port: port,
          password: password
        })
      })

      // Versuche Response zu lesen, unabhängig vom HTTP-Status
      let data
      let responseText = ''
      
      try {
        responseText = await response.text()
        console.log('Raw response:', responseText)
        
        // Versuche JSON zu parsen
        if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
          data = JSON.parse(responseText)
        } else {
          // Kein JSON, erstelle Standard-Response basierend auf HTTP-Status
          data = { 
            success: response.ok,
            error: response.ok ? null : `HTTP ${response.status}: ${response.statusText}`
          }
        }
      } catch (parseError) {
        console.log('Response parsing error:', parseError)
        
        // Fallback basierend auf HTTP-Status
        data = { 
          success: response.ok,
          error: response.ok ? null : `Server-Fehler (HTTP ${response.status})`
        }
      }

      // Überprüfe, ob die Response erfolgreich war
      if (!response.ok) {
        console.error('Login request failed:', response.status, response.statusText)
        
        let errorMessage = 'Unbekannter Server-Fehler'
        if (response.status === 500) {
          errorMessage = 'Interner Server-Fehler - API nicht verfügbar'
        } else if (response.status === 404) {
          errorMessage = 'API-Endpunkt nicht gefunden'
        } else if (response.status >= 400) {
          errorMessage = `Server-Fehler: ${response.status} ${response.statusText}`
        }
        
        await Swal.fire({
          title: 'Anmeldung fehlgeschlagen!',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK'
        })
        return false
      }

      if (data.success) {
        isAuthenticated.value = true
        coreHost.value = host
        corePort.value = port
        
        // Speichere Authentifizierung in localStorage
        localStorage.setItem('aj_authenticated', 'true')
        localStorage.setItem('aj_core_host', host)
        localStorage.setItem('aj_core_port', port)
        
        await Swal.fire({
          title: 'Erfolgreich angemeldet!',
          text: `Verbunden mit ${host}:${port}`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        })
        
        return true
      } else {
        // Fehlgeschlagene Anmeldung
        let errorMessage = 'settings.xml nicht lesbar'
        let iconType: 'error' | 'warning' = 'error'
        
        if (data.error) {
          if (data.error.includes('password')) {
            errorMessage = 'Ungültiges Passwort'
          } else if (data.error.includes('Host nicht erreichbar')) {
            errorMessage = data.error
            iconType = 'warning'
          } else {
            errorMessage = data.error
          }
        }
        
        await Swal.fire({
          title: 'Anmeldung fehlgeschlagen!',
          text: errorMessage,
          icon: iconType,
          confirmButtonText: 'OK'
        })
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      await Swal.fire({
        title: 'Verbindungsfehler!',
        text: 'Konnte keine Verbindung zur API herstellen.',
        icon: 'error',
        confirmButtonText: 'OK'
      })
      return false
    }
  }

  const logout = async (): Promise<void> => {
    const result = await Swal.fire({
      title: 'Abmelden?',
      text: 'Möchten Sie sich wirklich abmelden?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ja, abmelden',
      cancelButtonText: 'Abbrechen'
    })

    if (result.isConfirmed) {
      // Lokale Abmeldung (da wir direkt mit Core-Server kommunizieren)
      isAuthenticated.value = false
      coreHost.value = ''
      corePort.value = ''
      
      // Entferne gespeicherte Authentifizierung
      localStorage.removeItem('aj_authenticated')
      localStorage.removeItem('aj_core_host')
      localStorage.removeItem('aj_core_port')
      
      await Swal.fire({
        title: 'Abgemeldet!',
        text: 'Sie wurden erfolgreich abgemeldet.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      })
    }
  }

  // Helper function to make proxy requests
  const makeProxyRequest = async (type: string, file: string, method: string = 'GET', body?: any) => {
    try {
      const options: RequestInit = {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Wichtig für Session-Cookies
      }

      if (body && method !== 'GET') {
        options.body = JSON.stringify(body)
      }

      console.log(`Making proxy request: ${method} /api/proxy/${type}/${file}`)
      console.log('Request options:', options)
      
      const response = await fetch(`/api/proxy/${type}/${file}`, options)
      
      console.log(`Response status: ${response.status}`)
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('401 Unauthorized - Session problem detected')
          
          // Versuche Auth-Status zu überprüfen bevor wir die Session als abgelaufen markieren
          try {
            const authCheckResponse = await fetch('/api/auth-status', {
              method: 'GET',
              credentials: 'include'
            })
            
            if (authCheckResponse.ok) {
              const authData = await authCheckResponse.json()
              console.log('Auth status check result:', authData)
              
              if (!authData.authenticated) {
                // Session ist wirklich abgelaufen
                isAuthenticated.value = false
                localStorage.removeItem('aj_authenticated')
                localStorage.removeItem('aj_core_host')
                localStorage.removeItem('aj_core_port')
                throw new Error('Session abgelaufen - bitte neu anmelden')
              }
            }
          } catch (authCheckError) {
            console.error('Auth status check failed:', authCheckError)
          }
          
          // Session abgelaufen
          isAuthenticated.value = false
          localStorage.removeItem('aj_authenticated')
          localStorage.removeItem('aj_core_host')
          localStorage.removeItem('aj_core_port')
          throw new Error('Session abgelaufen - bitte neu anmelden')
        }
        
        // Versuche Response-Body zu lesen für bessere Fehlermeldungen
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorBody = await response.text()
          if (errorBody) {
            console.error('Error response body:', errorBody)
            const errorData = JSON.parse(errorBody)
            if (errorData.error) {
              errorMessage = errorData.error
            }
          }
        } catch (parseError) {
          console.log('Could not parse error response')
        }
        
        throw new Error(errorMessage)
      }

      const result = await response.text()
      console.log(`Proxy response: ${result.length} characters received`)
      return result
    } catch (error) {
      console.error('Proxy request error:', error)
      throw error
    }
  }

  // Session heartbeat - prüft regelmäßig ob die Session noch aktiv ist
  const startSessionHeartbeat = () => {
    setInterval(async () => {
      if (isAuthenticated.value) {
        try {
          const response = await fetch('/api/auth-status', {
            method: 'GET',
            credentials: 'include'
          })
          
          if (response.ok) {
            const data = await response.json()
            if (!data.authenticated) {
              console.log('Session expired detected by heartbeat')
              isAuthenticated.value = false
              localStorage.removeItem('aj_authenticated')
              localStorage.removeItem('aj_core_host')
              localStorage.removeItem('aj_core_port')
            }
          }
        } catch (error) {
          console.error('Session heartbeat error:', error)
        }
      }
    }, 60000) // Prüfe alle 60 Sekunden
  }

  return {
    isAuthenticated,
    coreHost,
    corePort,
    login,
    logout,
    checkAuthStatus,
    makeProxyRequest,
    startSessionHeartbeat
  }
})