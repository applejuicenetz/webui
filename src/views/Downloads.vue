<template>
  <div class="downloads-page">
    <CContainer fluid>
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader class="d-flex justify-content-between align-items-center">
              <h4 class="mb-0">
                <CIcon :icon="cilCloudDownload" class="me-2" />
                Downloads
              </h4>
              <div>
                <CBadge color="primary" class="me-2">
                  {{ downloads.filter(d => d.status === 'downloading').length }} aktiv
                </CBadge>
                <CBadge color="success" class="me-2">
                  {{ downloads.filter(d => d.status === 'completed').length }} abgeschlossen
                </CBadge>
                <CBadge color="warning" class="me-2">
                  {{ downloads.filter(d => d.status === 'paused').length }} pausiert
                </CBadge>
                <CBadge color="info">
                  {{ downloads.filter(d => d.status === 'waiting').length }} wartend
                </CBadge>
              </div>
            </CCardHeader>
            <CCardBody>
              <CRow class="mb-3">
                <CCol :md="6">
                  <CInputGroup>
                    <CFormInput
                      v-model="searchTerm"
                      placeholder="Downloads durchsuchen..."
                    />
                    <CButton color="primary" variant="outline">
                      <CIcon :icon="cilMagnifyingGlass" />
                    </CButton>
                  </CInputGroup>
                </CCol>
                <CCol :md="6" class="text-end">
                  <CButton color="primary" class="me-2" @click="showAddDownloadModal = true">
                    <CIcon :icon="cilPlus" class="me-1" />
                    Neuer Download
                  </CButton>
                </CCol>
              </CRow>

              <div v-if="error" class="alert alert-danger mb-3">
                <strong>Fehler:</strong> {{ error }}
              </div>

              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Dateiname</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Fortschritt</CTableHeaderCell>
                    <CTableHeaderCell>PDL</CTableHeaderCell>
                    <CTableHeaderCell>Geschwindigkeit</CTableHeaderCell>
                    <CTableHeaderCell>Aktionen</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  <CTableRow v-for="download in filteredDownloads" :key="download.id">
                    <CTableDataCell>
                      <div class="fw-semibold">{{ download.fileName }}</div>
                     {{ download.sources }} | {{ download.size }}
                    </CTableDataCell>
                    <CTableDataCell><CBadge :color="getStatusColor(download.status)">
                        {{ getStatusText(download.status) }}
                      </CBadge></CTableDataCell>
                    <CTableDataCell style="min-width: 150px">
                      <div class="d-flex align-items-center">
                        <div class="me-2" style="width: 40px">{{ download.progress }}%</div>
                        <CProgress
                          :value="download.progress"
                          class="flex-grow-1"
                          :color="getProgressColor(download.status)"
                        />
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>

                    </CTableDataCell>
                    <CTableDataCell>{{ download.speed }}</CTableDataCell>
                    <CTableDataCell>{{ download.eta }}</CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        size="sm"
                        :color="download.status === 'downloading' ? 'warning' : 'primary'"
                        variant="ghost"
                        @click="pauseResume(download)"
                        :disabled="download.status === 'completed'"
                        class="me-1"
                      >
                        <CIcon :icon="download.status === 'downloading' ? cilMediaPause : cilMediaPlay" />
                      </CButton>
                      <CButton
                        size="sm"
                        color="danger"
                        variant="ghost"
                        @click="cancelDownload(download)"
                      >
                        <CIcon :icon="cilX" />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>

              <div v-if="filteredDownloads.length === 0" class="text-center py-4">
                <CIcon :icon="cilInbox" size="xl" class="text-muted mb-2" />
                <p class="text-muted">Keine Downloads gefunden</p>
                <CButton color="primary" @click="showAddDownloadModal = true">
                  <CIcon :icon="cilPlus" class="me-1" />
                  Download hinzufügen
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  </div>

  <!-- Modal zum Hinzufügen eines neuen Downloads -->
  <CModal
    :visible="showAddDownloadModal"
    @close="showAddDownloadModal = false"
    title="Neuen Download hinzufügen"
    size="lg"
  >
    <CModalHeader>
      <CModalTitle>Neuen Download hinzufügen</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm @submit.prevent="addDownload(newDownloadUrl)">
        <CFormLabel for="download-url">Download-URL</CFormLabel>
        <CInputGroup class="mb-3">
          <CFormInput
            id="download-url"
            v-model="newDownloadUrl"
            placeholder="ajfsp://file|..."
            required
          />
        </CInputGroup>
        <div class="small text-muted mb-3">
          Unterstützte Formate: ajfsp://, http://, https://
        </div>
      </CForm>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="showAddDownloadModal = false">
        Abbrechen
      </CButton>
      <CButton color="primary" @click="addDownload(newDownloadUrl)" :disabled="!newDownloadUrl">
        Download starten
      </CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCoreStore } from '../stores/core.js'
import { useAuthStore } from '../stores/auth.js'
import { useRouter } from 'vue-router'
import coreService from '../services/coreService.js'
import { config } from '../utils/config.js'
import {
  CContainer, CRow, CCol, CCard, CCardHeader, CCardBody,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, CBadge, CProgress, CSpinner, CInputGroup, CFormInput,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CForm, CFormLabel
} from '@coreui/vue'
import { CIcon } from '@coreui/icons-vue'
import {
  cilCloudDownload, cilReload, cilMagnifyingGlass, cilPlus,
  cilMediaPause, cilMediaPlay, cilX, cilInbox
} from '@coreui/icons'

const router = useRouter()
const coreStore = useCoreStore()
const authStore = useAuthStore()

// Reaktive Daten
const searchTerm = ref('')
const isLoading = ref(false)
const error = ref(null)
const showAddDownloadModal = ref(false)
const newDownloadUrl = ref('')

// Downloads aus dem Core
const downloads = ref([])

// Gefilterte Downloads basierend auf Suchbegriff
const filteredDownloads = computed(() => {
  if (!searchTerm.value) return downloads.value
  return downloads.value.filter(download =>
    download.fileName.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

// Status-Farbe basierend auf Download-Status
const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'success'
    case 'downloading': return 'primary'
    case 'paused': return 'warning'
    case 'failed': return 'danger'
    case 'waiting': return 'info'
    default: return 'secondary'
  }
}

// Fortschrittsbalken-Farbe basierend auf Download-Status
const getProgressColor = (status) => {
  switch (status) {
    case 'completed': return 'success'
    case 'downloading': return 'info'
    case 'paused': return 'warning'
    case 'failed': return 'danger'
    case 'waiting': return 'secondary'
    default: return 'info'
  }
}

// Status-Text auf Deutsch
const getStatusText = (status) => {
  switch (status) {
    case 'completed': return 'Abgeschlossen'
    case 'downloading': return 'Lädt herunter'
    case 'paused': return 'Pausiert'
    case 'failed': return 'Fehlgeschlagen'
    case 'waiting': return 'Wartend'
    default: return status
  }
}

// Die Funktionen formatBytes und formatTime sind bereits weiter unten in der Datei definiert

// Downloads aktualisieren
const refreshDownloads = async () => {
  try {
    isLoading.value = true
    error.value = null

    console.log('Refreshing downloads from core...')
    await coreStore.refresh()

    // Daten aus dem Core extrahieren
    await loadDownloadsFromCore()

    console.log('Downloads refreshed:', downloads.value)
  } catch (err) {
    error.value = err.message
    console.error('Error refreshing downloads:', err)
  } finally {
    isLoading.value = false
  }
}

// Downloads aus dem Core laden
const loadDownloadsFromCore = async () => {
  try {
    // Direkter Zugriff auf die XML-Daten
    const response = await coreService.command('xml', 'modified.xml')
    console.log('Modified XML response:', response)

    // Downloads aus der XML extrahieren
    const downloadsList = []

    // Debug: Struktur der Antwort ausgeben
    console.log('Modified XML structure:', response ? Object.keys(response) : 'null')

    // Versuche, die XML-Datei über den coreService zu laden, wenn die API-Antwort nicht funktioniert
    if (!response || !response.applejuice) {
      console.log('Trying to load modified.xml via coreService')
      try {
        // Lade die XML über den coreService, der einen Proxy verwendet
        const xmlResponse = await coreService.command('text', 'modified.xml')
        console.log('Core XML loaded via coreService')

        // Speichere die XML-Antwort
        const xmlText = xmlResponse
        console.log('Core XML loaded, length:', xmlText.length)

        // Entferne den HTML-Header, wenn vorhanden
        let cleanXmlText = xmlText
        if (cleanXmlText.includes('This XML file does not appear to have any style information')) {
          cleanXmlText = cleanXmlText.substring(cleanXmlText.indexOf('<applejuice>'))
        }
        console.log('Cleaned XML starts with:', cleanXmlText.substring(0, 50))

        // Manuelles Parsen der XML
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(cleanXmlText, 'text/xml')

        // Extrahiere downloadid-Elemente
        const downloadIdElements = xmlDoc.querySelectorAll('downloadid')
        console.log('Found downloadid elements:', downloadIdElements.length)

        // Extrahiere user-Elemente
        const userElements = xmlDoc.querySelectorAll('user')
        console.log('Found user elements:', userElements.length)

        // Verarbeite downloadid-Elemente
        downloadIdElements.forEach(downloadIdElement => {
          const downloadId = downloadIdElement.getAttribute('id')
          if (!downloadId) return

          // Sammle alle Benutzer für diesen Download
          const userIds = []
          const userIdElements = downloadIdElement.querySelectorAll('userid')
          userIdElements.forEach(userIdElement => {
            const userId = userIdElement.getAttribute('id')
            if (userId) userIds.push(userId)
          })

          // Finde Benutzer mit Dateinamen für diesen Download
          const usersForDownload = []
          userElements.forEach(userElement => {
            if (userElement.getAttribute('downloadid') === downloadId) {
              usersForDownload.push({
                id: userElement.getAttribute('id'),
                filename: userElement.getAttribute('filename'),
                speed: parseInt(userElement.getAttribute('speed') || '0'),
                status: userElement.getAttribute('status'),
                directstate: userElement.getAttribute('directstate'),
                nickname: userElement.getAttribute('nickname')
              })
            }
          })

          // Finde den Dateinamen aus dem ersten Benutzer mit einem Dateinamen
          let fileName = `Download ${downloadId}`
          let fileSize = 0
          let downloadStatus = 'waiting'

          for (const user of usersForDownload) {
            if (user.filename && user.filename !== '') {
              fileName = user.filename
              break
            }
          }

          // Bestimme den Status basierend auf den Benutzern
          const activeUsers = usersForDownload.filter(user =>
            user.status === '7' || user.status === '8' || user.status === '9'
          )

          if (activeUsers.length > 0) {
            downloadStatus = 'downloading'
          } else if (usersForDownload.some(user => user.status === '15')) {
            downloadStatus = 'waiting'
          }

          // Berechne die Gesamtgeschwindigkeit
          const totalSpeed = usersForDownload.reduce((sum, user) => sum + (user.speed || 0), 0)

          // Füge den Download zur Liste hinzu
          downloadsList.push({
            id: downloadId,
            fileName: fileName,
            size: 'Berechne...',
            rawSize: fileSize,
            progress: 0, // Fortschritt kann nicht berechnet werden ohne Dateigröße
            status: downloadStatus,
            speed: formatBytes(totalSpeed) + '/s',
            eta: '--:--:--',
            sources: userIds.length,
            loaded: 0,
            rawData: { downloadId, userIds, usersForDownload }
          })
        })
      } catch (localErr) {
        console.error('Error loading local XML:', localErr)
      }
    }

    // Verarbeite die API-Antwort, wenn sie vorhanden ist
    else {
      console.log('Processing API response')

      // Verarbeite applejuice.ids.downloadid-Elemente
      if (response.applejuice && response.applejuice.ids && response.applejuice.ids.downloadid) {
        const downloadIdItems = Array.isArray(response.applejuice.ids.downloadid)
          ? response.applejuice.ids.downloadid
          : [response.applejuice.ids.downloadid]

        console.log('Found downloadid elements:', downloadIdItems.length)

        // Verarbeite user-Elemente
        const userItems = []
        if (response.applejuice.user) {
          const users = Array.isArray(response.applejuice.user)
            ? response.applejuice.user
            : [response.applejuice.user]

          users.forEach(user => userItems.push(user))
        }

        console.log('Found user elements:', userItems.length)

        // Jeden downloadid verarbeiten
        downloadIdItems.forEach(item => {
          if (!item || !item.id) return

          const downloadId = item.id

          // Sammle alle Benutzer für diesen Download
          const userIds = []
          if (item.userid) {
            const userIdItems = Array.isArray(item.userid) ? item.userid : [item.userid]
            userIdItems.forEach(userId => {
              if (userId && userId.id) userIds.push(userId.id)
            })
          }

          // Finde Benutzer mit Dateinamen für diesen Download
          const usersForDownload = userItems.filter(user => user.downloadid === downloadId)

          // Finde den Dateinamen aus dem ersten Benutzer mit einem Dateinamen
          let fileName = `Download ${downloadId}`
          let fileSize = 0
          let downloadStatus = 'waiting'

          for (const user of usersForDownload) {
            if (user.filename && user.filename !== '') {
              fileName = user.filename
              break
            }
          }

          // Bestimme den Status basierend auf den Benutzern
          const activeUsers = usersForDownload.filter(user =>
            user.status === '7' || user.status === '8' || user.status === '9'
          )

          if (activeUsers.length > 0) {
            downloadStatus = 'downloading'
          } else if (usersForDownload.some(user => user.status === '15')) {
            downloadStatus = 'waiting'
          }

          // Berechne die Gesamtgeschwindigkeit
          const totalSpeed = usersForDownload.reduce((sum, user) => sum + parseInt(user.speed || '0'), 0)

          // Füge den Download zur Liste hinzu
          downloadsList.push({
            id: downloadId,
            fileName: fileName,
            size: 'Berechne...',
            rawSize: fileSize,
            progress: 0, // Fortschritt kann nicht berechnet werden ohne Dateigröße
            status: downloadStatus,
            speed: formatBytes(totalSpeed) + '/s',
            eta: '--:--:--',
            sources: userIds.length,
            loaded: 0,
            rawData: { downloadId, userIds, usersForDownload }
          })
        })
      }
    }

    // Wenn keine Downloads gefunden wurden, zeige eine Nachricht
    if (downloadsList.length === 0) {
      console.warn('No downloads found in modified.xml')

      // Versuche, die XML-Datei direkt als Text zu verarbeiten
      console.log('Trying to parse XML manually as text')
      try {
        // Verwende die XML-Datei vom Core, wenn verfügbar
        const xmlTextToUse = typeof xmlText !== 'undefined' ? xmlText : ''

        // Suche nach downloadid-Elementen mit regulären Ausdrücken
        const downloadIdRegex = /<downloadid id="(\d+)"[^>]*>/g
        let match
        const downloadIds = []

        while ((match = downloadIdRegex.exec(xmlTextToUse)) !== null) {
          downloadIds.push(match[1])
        }

        console.log('Found downloadid elements via regex:', downloadIds.length)

        // Suche nach user-Elementen mit regulären Ausdrücken - flexibler Ausdruck, der die Attributreihenfolge nicht berücksichtigt
        const userRegex = /<user\s+([^>]*)>/g

        const users = []
        while ((match = userRegex.exec(xmlTextToUse)) !== null) {
          const attributeString = match[1]

          // Extrahiere die Attribute mit einem separaten regulären Ausdruck
          const idMatch = attributeString.match(/id="(\d+)"/)
          const downloadIdMatch = attributeString.match(/downloadid="(\d+)"/)
          const statusMatch = attributeString.match(/status="(\d+)"/)
          const speedMatch = attributeString.match(/speed="(\d+)"/)
          const filenameMatch = attributeString.match(/filename="([^"]*)"/)
          const nicknameMatch = attributeString.match(/nickname="([^"]*)"/)
          const downloadFromMatch = attributeString.match(/downloadfrom="([^"]*)"/)
          const downloadToMatch = attributeString.match(/downloadto="([^"]*)"/)
          const actualPositionMatch = attributeString.match(/actualdownloadposition="([^"]*)"/)

          if (idMatch && downloadIdMatch) {
            users.push({
              id: idMatch[1],
              downloadid: downloadIdMatch[1],
              status: statusMatch ? statusMatch[1] : '0',
              speed: speedMatch ? parseInt(speedMatch[1]) : 0,
              filename: filenameMatch ? filenameMatch[1] : '',
              nickname: nicknameMatch ? nicknameMatch[1] : '?',
              downloadFrom: downloadFromMatch ? parseInt(downloadFromMatch[1]) : -1,
              downloadTo: downloadToMatch ? parseInt(downloadToMatch[1]) : -1,
              actualPosition: actualPositionMatch ? parseInt(actualPositionMatch[1]) : -1,
              attributeString: attributeString // Speichere den kompletten Attributstring für spätere Verarbeitung
            })
          }
        }

        console.log('Found user elements via regex:', users.length)

        // Verarbeite jeden Download
        downloadIds.forEach(downloadId => {
          // Finde Benutzer für diesen Download
          const usersForDownload = users.filter(user => user.downloadid === downloadId)

          // Finde den Dateinamen aus dem ersten Benutzer mit einem Dateinamen
          let fileName = `Download ${downloadId}`
          let downloadStatus = 'waiting'

          for (const user of usersForDownload) {
            if (user.filename && user.filename !== '') {
              fileName = user.filename
              break
            }
          }

          // Bestimme den Status basierend auf den Benutzern
          const activeUsers = usersForDownload.filter(user =>
            user.status === '7' || user.status === '8' || user.status === '9'
          )

          if (activeUsers.length > 0) {
            downloadStatus = 'downloading'
          } else if (usersForDownload.some(user => user.status === '15')) {
            downloadStatus = 'waiting'
          }

          // Berechne die Gesamtgeschwindigkeit
          const totalSpeed = usersForDownload.reduce((sum, user) => sum + (user.speed || 0), 0)

          // Extrahiere Informationen aus dem XML für jeden Download
          let estimatedSize = 0
          let downloadedBytes = 0
          let restBytes = 0
          let progress = 0

          // Suche nach Größeninformationen in den Attributen
          for (const user of usersForDownload) {
            // Suche nach SIZE-Attribut
            const sizeMatch = user.attributeString.match(/size="(\d+)"/)
            if (sizeMatch && parseInt(sizeMatch[1]) > 0) {
              estimatedSize = parseInt(sizeMatch[1])
              break
            }
          }

          // Suche nach REST-Attribut (verbleibende Bytes)
          for (const user of usersForDownload) {
            const restMatch = user.attributeString.match(/rest="(\d+)"/)
            if (restMatch && parseInt(restMatch[1]) >= 0) {
              restBytes = parseInt(restMatch[1])
              break
            }
          }

          // Wenn wir die Größe und den Rest haben, können wir den Fortschritt berechnen
          if (estimatedSize > 0 && restBytes >= 0) {
            downloadedBytes = estimatedSize - restBytes
            progress = Math.min(Math.round((downloadedBytes / estimatedSize) * 100), 100)
          } else {
            // Fallback: Suche nach actualPosition für den Fortschritt
            for (const user of activeUsers) {
              if (user.actualPosition > 0) {
                downloadedBytes = Math.max(downloadedBytes, user.actualPosition)
              }
            }

            // Wenn keine Größeninformationen gefunden wurden, verwende einen Standardwert
            if (estimatedSize === 0) {
              estimatedSize = 100 * 1024 * 1024 // 100 MB als Standardwert
            }

            // Berechne den Fortschritt in Prozent
            if (estimatedSize > 0 && downloadedBytes > 0) {
              progress = Math.min(Math.round((downloadedBytes / estimatedSize) * 100), 100)
            }
          }

          // Berechne die geschätzte verbleibende Zeit (ETA) basierend auf dem PHP-Code
          let eta = '--:--:--'
          let restzeit = 0

          if (totalSpeed > 0 && restBytes > 0) {
            // Berechnung wie im PHP-Code: restzeit = rest / speed
            restzeit = restBytes / totalSpeed
            eta = formatTime(restzeit)
          } else if (totalSpeed > 0 && estimatedSize > downloadedBytes) {
            // Fallback: Berechne basierend auf verbleibenden Bytes und Geschwindigkeit
            restzeit = (estimatedSize - downloadedBytes) / totalSpeed
            eta = formatTime(restzeit)
          }

          // Füge den Download zur Liste hinzu
          downloadsList.push({
            id: downloadId,
            fileName: fileName,
            size: formatBytes(estimatedSize),
            rawSize: estimatedSize,
            progress: progress,
            status: downloadStatus,
            speed: formatBytes(totalSpeed) + '/s',
            eta: eta,
            sources: usersForDownload.length,
            loaded: downloadedBytes,
            rawData: { downloadId, usersForDownload }
          })
        })
      } catch (regexErr) {
        console.error('Error parsing XML with regex:', regexErr)

        // Füge einen Beispiel-Download hinzu, wenn keine Downloads gefunden wurden
        if (process.env.NODE_ENV === 'development') {
          downloadsList.push({
            id: 'example',
            fileName: 'Beispiel-Download.mp4',
            size: '1.5 GB',
            rawSize: 1500000000,
            progress: 35,
            status: 'downloading',
            speed: '1.2 MB/s',
            eta: '00:15:30',
            sources: 3,
            loaded: 525000000,
            rawData: null
          })
        }
      }
    }

    // Downloads aktualisieren
    downloads.value = downloadsList
    console.log('Parsed downloads:', downloadsList)

  } catch (err) {
    console.error('Error loading downloads from core:', err)
    error.value = 'Fehler beim Laden der Downloads: ' + err.message

    // Füge einen Beispiel-Download hinzu, wenn ein Fehler auftritt
    if (process.env.NODE_ENV === 'development') {
      downloads.value = [{
        id: 'example',
        fileName: 'Beispiel-Download.mp4',
        size: '1.5 GB',
        rawSize: 1500000000,
        progress: 35,
        status: 'downloading',
        speed: '1.2 MB/s',
        eta: '00:15:30',
        sources: 3,
        loaded: 525000000,
        rawData: null
      }]
    }
  }
}

// Hilfsfunktion: Bytes in lesbare Größe umwandeln
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Hilfsfunktion: Sekunden in lesbare Zeit umwandeln
const formatTime = (seconds) => {
  if (!seconds || seconds <= 0) return '--:--:--'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':')
}

// Download pausieren oder fortsetzen
const pauseResume = async (download) => {
  try {
    const downloadId = download.id

    if (download.status === 'downloading') {
      // Download pausieren
      console.log(`Pausing download ${downloadId}...`)
      await coreService.command('function', 'pausedownload', { id: downloadId })

      // Status lokal aktualisieren (wird beim nächsten Refresh überschrieben)
      download.status = 'paused'
      download.speed = '0 KB/s'
      download.eta = '--:--:--'

      console.log(`Download ${downloadId} paused`)
    } else if (download.status === 'paused' || download.status === 'waiting') {
      // Download fortsetzen
      console.log(`Resuming download ${downloadId}...`)
      await coreService.command('function', 'resumedownload', { id: downloadId })

      // Status lokal aktualisieren (wird beim nächsten Refresh überschrieben)
      download.status = 'downloading'

      console.log(`Download ${downloadId} resumed`)
    }

    // Nach kurzer Verzögerung aktualisieren, um den neuen Status zu sehen
    setTimeout(() => refreshDownloads(), 1000)
  } catch (err) {
    error.value = `Fehler beim Pausieren/Fortsetzen des Downloads: ${err.message}`
    console.error('Error pausing/resuming download:', err)
  }
}

// Download abbrechen
const cancelDownload = async (download) => {
  try {
    const downloadId = download.id

    console.log(`Cancelling download ${downloadId}...`)
    await coreService.command('function', 'canceldownload', { id: downloadId })

    // Lokal aus der Liste entfernen (wird beim nächsten Refresh aktualisiert)
    const index = downloads.value.findIndex(d => d.id === downloadId)
    if (index > -1) {
      downloads.value.splice(index, 1)
    }

    console.log(`Download ${downloadId} cancelled`)
  } catch (err) {
    error.value = `Fehler beim Abbrechen des Downloads: ${err.message}`
    console.error('Error cancelling download:', err)
  }
}

// Neuen Download hinzufügen
const addDownload = async (url) => {
  if (!url) return

  try {
    console.log(`Adding new download: ${url}`)

    // Download zum Core hinzufügen
    await coreService.command('function', 'adddownload', { url: url })

    // Downloads aktualisieren, um den neuen Download zu sehen
    setTimeout(() => refreshDownloads(), 1000)

    // Modal schließen
    showAddDownloadModal.value = false
  } catch (err) {
    error.value = `Fehler beim Hinzufügen des Downloads: ${err.message}`
    console.error('Error adding download:', err)
  }
}

// Initialisierung
const initializeData = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  try {
    isLoading.value = true
    error.value = null

    console.log('Initializing downloads data from core...')
    await coreStore.loadCoreData()

    // Downloads aus dem Core laden
    await loadDownloadsFromCore()

    console.log('Downloads initialized')
  } catch (err) {
    error.value = err.message
    console.error('Error initializing downloads:', err)

    // Bei Authentifizierungsfehlern zur Login-Seite weiterleiten
    if (err.message.includes('Wrong password') ||
        err.message.includes('Not authenticated')) {
      router.push('/login')
    }
  } finally {
    isLoading.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  console.log('Downloads view mounted')
  initializeData()

  // Auto-Update starten (alle 10 Sekunden)
  const interval = setInterval(refreshDownloads, 1000)

  // Cleanup beim Unmount
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>
