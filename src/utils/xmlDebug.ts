/**
 * Debug-Hilfsfunktionen für XML-Anfragen
 */

export async function debugXmlRequest(file: string): Promise<void> {
  console.group(`Debug XML Request: ${file}`)
  
  try {
    // 1. Prüfe Session-Status
    console.log('1. Prüfe Session-Status...')
    const authResponse = await fetch('/api/auth-status', {
      credentials: 'include'
    })
    const authData = await authResponse.json()
    console.log('Session Status:', authData)
    
    if (!authData.authenticated) {
      console.error('Nicht authentifiziert!')
      return
    }
    
    // 2. Mache XML-Request
    console.log(`2. Lade ${file}...`)
    const xmlResponse = await fetch(`/api/proxy/xml/${file}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Response Status:', xmlResponse.status)
    console.log('Response Headers:', [...xmlResponse.headers.entries()])
    console.log('Response Content-Type:', xmlResponse.headers.get('content-type'))
    
    if (!xmlResponse.ok) {
      const errorText = await xmlResponse.text()
      console.error('Request failed:', xmlResponse.status, xmlResponse.statusText)
      console.error('Error Response Body:', errorText)
      return
    }
    
    const xmlContent = await xmlResponse.text()
    console.log('XML Content Length:', xmlContent.length)
    console.log('XML Content Type Check:', xmlContent.trim().startsWith('<') ? 'Looks like XML' : 'NOT XML!')
    console.log('XML Preview (first 300 chars):')
    console.log(xmlContent.substring(0, 300))
    
    if (!xmlContent.trim().startsWith('<')) {
      console.error('Response is not XML! Full content:')
      console.error(xmlContent)
    }
    
    // 3. Versuche XML zu parsen
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml')
      const parseError = xmlDoc.querySelector('parsererror')
      
      if (parseError) {
        console.warn('XML Parse Warning:', parseError.textContent)
      } else {
        console.log('XML erfolgreich geparst')
        console.log('Root Element:', xmlDoc.documentElement?.nodeName)
        console.log('Anzahl Elemente:', xmlDoc.getElementsByTagName('*').length)
      }
    } catch (parseError) {
      console.error('XML Parse Error:', parseError)
    }
    
  } catch (error) {
    console.error('Debug Error:', error)
  } finally {
    console.groupEnd()
  }
}

export async function debugAllXmlFiles(): Promise<void> {
  const xmlFiles = ['settings.xml', 'information.xml', 'modified.xml', 'share.xml']
  
  console.log('Starte Debug-Test für alle XML-Dateien...')
  
  for (const file of xmlFiles) {
    await debugXmlRequest(file)
    await new Promise(resolve => setTimeout(resolve, 500)) // Kurze Pause zwischen Requests
  }
  
  console.log('Debug-Test abgeschlossen!')
}

// Globale Debug-Funktionen für Browser-Console
if (typeof window !== 'undefined') {
  const globalWindow = window as any
  globalWindow.debugXmlRequest = debugXmlRequest
  globalWindow.debugAllXmlFiles = debugAllXmlFiles
  console.log('XML Debug-Funktionen verfügbar:')
  console.log('  - debugXmlRequest("settings.xml")')
  console.log('  - debugAllXmlFiles()')
}