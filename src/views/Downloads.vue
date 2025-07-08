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
                  {{ downloads.filter(d => ['0', '0_1', '0_2', '12', '16', 'downloading', 'waiting'].includes(d.status)).length }} aktiv
                </CBadge>
                <CBadge color="success" class="me-2">
                  {{ downloads.filter(d => d.status === '14' || d.status === 'completed').length }} abgeschlossen
                </CBadge>
                <CBadge color="warning" class="me-2">
                  {{ downloads.filter(d => d.status === '18' || d.status === 'paused').length }} pausiert
                </CBadge>
                <CBadge color="danger" class="me-2">
                  {{ downloads.filter(d => ['1', '13', '15', '17', 'failed'].includes(d.status)).length }} fehler
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

              <div class="table-responsive">
                <table class="table border mb-0">
                  <thead class="fw-semibold text-nowrap">
                    <tr class="align-middle">
                      <th class="bg-body-secondary"></th>
                      <th class="bg-body-secondary">Dateiennamen</th>
                      <th class="bg-body-secondary">Status</th>
                      <th class="bg-body-secondary">Fortschritt</th>
                      <th class="bg-body-secondary text-center">PDL</th>
                      <th class="bg-body-secondary">Geschwindigkeit</th>
                      <th class="bg-body-secondary">ETA</th>
                      <th class="bg-body-secondary"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="download in filteredDownloads" :key="download.id" class="align-middle">
                      <td>
                        <input class="form-check-input" type="checkbox" :id="'dlcheck_' + download.id">
                      </td>
                      <td>
                        <div class="text-nowrap">
                          <a @click="renameDownload(download)" title="Umbenennen">
                            {{ download.fileName.length > 40 ? download.fileName.substring(0, 40) + '...' : download.fileName }}
                          </a>
                        </div>
                        <div class="small text-body-secondary text-nowrap">
                          <span>
                            <a title="Mehr Info">
                              {{ download.sources }}/{{ download.sources }}
                            </a>
                          </span> | {{ download.size }}
                        </div>
                      </td>
                      <td class="text-center">
                        <span class="badge" :class="'bg-' + getStatusColor(download.status)">
                          {{ getStatusText(download.status) }}
                        </span>
                      </td>
                      <td>
                        <div class="d-flex justify-content-between align-items-baseline">
                          <div class="fw-semibold">{{ download.progress }}%</div>
                          <div class="text-nowrap small text-body-secondary ms-3">
                            {{ formatBytes(download.rawSize - download.loaded) }}
                          </div>
                        </div>
                        <div class="progress progress-thin">
                          <div class="progress-bar"
                               :class="'bg-' + getProgressColor(download.status)"
                               role="progressbar"
                               :style="'width: ' + download.progress + '%'"
                               :aria-valuenow="download.progress"
                               aria-valuemin="0"
                               aria-valuemax="100">
                          </div>
                        </div>
                      </td>
                      <td class="text-center">
                        <CBadge color="primary">{{ download.powerdownload || 0 }}</CBadge>
                      </td>
                      <td>
                        {{ download.speed }}
                      </td>
                      <td>
                        {{ download.eta }}
                      </td>
                      <td>
                        <div class="d-flex gap-1">
                          <CButton size="sm" color="light" @click.prevent="showDownloadInfo(download)" title="Info">
                            <CIcon :icon="cilInfo" />
                          </CButton>
                          <CButton
                            size="sm"
                            :color="['0', '0_1', '0_2', '12', '16', 'downloading', 'waiting'].includes(download.status) ? 'warning' : 'success'"
                            @click.prevent="pauseResume(download)"
                            :disabled="['14', 'completed', '1', '13', '15', '17', 'failed'].includes(download.status)"
                            :title="['0', '0_1', '0_2', '12', '16', 'downloading', 'waiting'].includes(download.status) ? 'Pausieren' : 'Fortsetzen'"
                          >
                            <CIcon :icon="['0', '0_1', '0_2', '12', '16', 'downloading', 'waiting'].includes(download.status) ? cilMediaPause : cilMediaPlay" />
                          </CButton>
                          <CButton size="sm" color="danger" @click.prevent="cancelDownload(download)" title="Löschen">
                            <CIcon :icon="cilX" />
                          </CButton>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-if="filteredDownloads.length === 0" class="text-center py-4 border rounded mt-3">
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
    backdrop="static"
  >
    <CModalHeader>
      <CModalTitle>
        <CIcon :icon="cilPlus" class="me-2" />
        Neuen Download hinzufügen
      </CModalTitle>
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
            autofocus
          />
        </CInputGroup>
        <div class="small text-muted mb-3">
          Unterstützte Formate: ajfsp://, http://, https://
        </div>
        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>
      </CForm>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="showAddDownloadModal = false">
        Abbrechen
      </CButton>
      <CButton color="primary" @click="addDownload(newDownloadUrl)" :disabled="!newDownloadUrl">
        <CIcon :icon="cilCloudDownload" class="me-1" />
        Download starten
      </CButton>
    </CModalFooter>
  </CModal>

  <!-- Modal für Download-Informationen -->
  <CModal
    id="info-modal"
    :visible="showInfoModal"
    @close="showInfoModal = false"
    title="Download-Informationen"
    size="xl"
    backdrop="static"
  >
    <CModalHeader>
      <CModalTitle>
        <CIcon :icon="cilInfo" class="me-2" />
        Download-Informationen: {{ selectedDownload ? selectedDownload.fileName : '' }}
      </CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div v-if="selectedDownload" class="table-responsive">
        <table class="table border mb-0">
          <thead class="fw-semibold text-nowrap">
            <tr class="align-middle">
              <th class="bg-body-secondary">Dateiennamen</th>
              <th class="bg-body-secondary">Status</th>
              <th class="bg-body-secondary">Fortschritt</th>
              <th class="bg-body-secondary text-center">PDL</th>
              <th class="bg-body-secondary">Geschwindigkeit</th>
              <th class="bg-body-secondary"></th>
            </tr>
          </thead>
          <tbody>
            <!-- Hauptdownload-Zeile -->
            <tr>
              <td>
                <div class="text-nowrap">
                  {{ selectedDownload.fileName.length > 40 ? selectedDownload.fileName.substring(0, 40) + '...' : selectedDownload.fileName }}
                </div>
                <div class="small text-body-secondary text-nowrap">
                  <span>{{ selectedDownload.sources }}/{{ selectedDownload.sources }}</span> | {{ selectedDownload.size }}
                </div>
              </td>
              <td class="text-center">
                <span class="badge" :class="'bg-' + getStatusColor(selectedDownload.status)">
                  {{ getStatusText(selectedDownload.status) }}
                </span>
              </td>
              <td>
                <div class="d-flex justify-content-between align-items-baseline">
                  <div class="fw-semibold">{{ selectedDownload.progress }}%</div>
                  <div class="text-nowrap small text-body-secondary ms-3">- {{ selectedDownload.eta }}</div>
                </div>
                <div class="progress progress-thin">
                  <div class="progress-bar"
                       :class="'bg-' + getProgressColor(selectedDownload.status)"
                       role="progressbar"
                       :style="'width: ' + selectedDownload.progress + '%'"
                       :aria-valuenow="selectedDownload.progress"
                       aria-valuemin="0"
                       aria-valuemax="100">
                  </div>
                </div>
              </td>
              <td class="text-center">
                {{ selectedDownload.sources }}
              </td>
              <td>
                {{ selectedDownload.speed }}
              </td>
              <td>
                <div class="d-flex gap-1">
                  <CButton size="sm" color="light" @click.prevent="renameDownload(selectedDownload)" title="Umbenennen">
                    <CIcon :icon="cilPencil" />
                  </CButton>
                  <CButton
                    size="sm"
                    :color="['0', '0_1', '0_2', '12', '16', 'downloading', 'waiting'].includes(selectedDownload.status) ? 'warning' : 'success'"
                    @click.prevent="pauseResume(selectedDownload)"
                    :disabled="['14', 'completed', '1', '13', '15', '17', 'failed'].includes(selectedDownload.status)"
                    :title="['0', '0_1', '0_2', '12', '16', 'downloading', 'waiting'].includes(selectedDownload.status) ? 'Pausieren' : 'Fortsetzen'"
                  >
                    <CIcon :icon="['0', '0_1', '0_2', '12', '16', 'downloading', 'waiting'].includes(selectedDownload.status) ? cilMediaPause : cilMediaPlay" />
                  </CButton>
                  <CButton size="sm" color="danger" @click.prevent="cancelDownload(selectedDownload)" title="Löschen">
                    <CIcon :icon="cilX" />
                  </CButton>
                </div>
              </td>
            </tr>

            <!-- Aktive Quellen -->
            <tr v-for="(source, index) in activeSources" :key="'active-' + index">
              <td>
                <div class="text-nowrap">
                  <CIcon :icon="cilArrowThickFromLeft" />
                  <CIcon :icon="cilMediaPlay" class="me-1" />
                  {{ source.filename || '...' }}
                </div>
                <div class="small text-body-secondary text-nowrap ms-5">
                  <span>User: <a href="#">{{ source.nickname || '?' }}</a></span> | {{ formatBytes(source.downloadedBytes || 0) }}
                </div>
              </td>
              <td class="text-center">Übertrage</td>
              <td>
                <div class="d-flex justify-content-between align-items-baseline">
                  <div class="fw-semibold">{{ source.progress || 0 }}%</div>
                  <div class="text-nowrap small text-body-secondary ms-3"></div>
                </div>
                <div class="progress progress-thin">
                  <div class="progress-bar bg-success"
                       role="progressbar"
                       :style="'width: ' + (source.progress || 0) + '%'"
                       :aria-valuenow="source.progress || 0"
                       aria-valuemin="0"
                       aria-valuemax="100">
                  </div>
                </div>
              </td>
              <td class="text-center">1</td>
              <td>{{ formatBytes(source.speed || 0) }}/s</td>
              <td>
                <div class="d-flex gap-1">
                  <CButton size="sm" color="light" title="Info">
                    <CIcon :icon="cilInfo" />
                  </CButton>
                  <CButton size="sm" color="light" title="Edit">
                    <CIcon :icon="cilPencil" />
                  </CButton>
                  <CButton size="sm" color="danger" title="Delete">
                    <CIcon :icon="cilX" />
                  </CButton>
                </div>
              </td>
            </tr>

            <!-- Warteschlange Header -->
            <tr v-if="queuedSources.length > 0">
              <td colspan="9">
                <a href="#" @click.prevent>
                  <CIcon :icon="cilMinus" />
                  <b>Warteschlange</b> ({{ queuedSources.length }})
                </a>
              </td>
            </tr>

            <!-- Rest Header -->
            <tr v-if="inactiveSources.length > 0">
              <td colspan="9">
                <a href="#" @click.prevent>
                  <CIcon :icon="cilMinus" />
                  <b>Rest</b> ({{ inactiveSources.length }})
                </a>
              </td>
            </tr>

            <tr v-if="inactiveSources.length > 0">
              <td colspan="2"></td>
              <td colspan="3">Quelle von</td>
            </tr>

            <!-- Inaktive Quellen -->
            <tr v-for="(source, index) in inactiveSources" :key="'inactive-' + index">
              <td>
                <div class="text-nowrap">
                  <CIcon :icon="cilArrowThickFromLeft" />
                  <CIcon :icon="cilMediaPause" class="me-1" />
                  {{ source.filename || '...' }}
                </div>
                <div class="small text-body-secondary text-nowrap ms-5">
                  <span>User: <a href="#">{{ source.nickname || '?' }}</a></span> | {{ formatBytes(source.downloadedBytes || 0) }}
                </div>
              </td>
              <td class="text-center">Eigenes Limit erreicht</td>
              <td>Server</td>
              <td class="text-center">1</td>
              <td>0 B/s</td>
              <td>
                <div class="d-flex gap-1">
                  <CButton size="sm" color="light" title="Info">
                    <CIcon :icon="cilInfo" />
                  </CButton>
                  <CButton size="sm" color="light" title="Edit">
                    <CIcon :icon="cilPencil" />
                  </CButton>
                  <CButton size="sm" color="danger" title="Delete">
                    <CIcon :icon="cilX" />
                  </CButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="showInfoModal = false">
        Schließen
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
  cilMediaPause, cilMediaPlay, cilX, cilInbox, cilOptions,
  cilPencil, cilInfo, cilArrowThickFromLeft, cilMinus, cilPlus as cilPlusIcon
} from '@coreui/icons'

// Wir verwenden CoreUI-Icons anstelle von SVG-Dateien

const router = useRouter()
const coreStore = useCoreStore()
const authStore = useAuthStore()

// Reaktive Daten
const searchTerm = ref('')
const isLoading = ref(false)
const error = ref(null)
const showAddDownloadModal = ref(false)
const showInfoModal = ref(false)
const newDownloadUrl = ref('')
const selectedDownload = ref(null)

// Downloads aus dem Core
const downloads = ref([])

// Quellen für den ausgewählten Download
const activeSources = ref([])
const queuedSources = ref([])
const inactiveSources = ref([])

// Gefilterte Downloads basierend auf Suchbegriff und sortiert nach Status
const filteredDownloads = computed(() => {
  // Filtere Downloads basierend auf Suchbegriff
  const filtered = !searchTerm.value 
    ? downloads.value 
    : downloads.value.filter(download =>
        download.fileName.toLowerCase().includes(searchTerm.value.toLowerCase())
      )
  
  // Sortiere Downloads nach Status
  return filtered.sort((a, b) => {
    // Definiere Prioritäten für verschiedene Status
    const statusPriority = {
      // Aktive Downloads zuerst
      '0': 1,      // Suchen/Laden
      '0_1': 2,    // Suchen
      '0_2': 3,    // Übertrage
      'downloading': 3, // Übertrage (alt)
      'waiting': 2,     // Suchen (alt)
      
      // Dann Downloads mit speziellen Status
      '16': 4,     // Erstelle .data
      '12': 5,     // Fertigstellen...
      
      // Dann pausierte Downloads
      '18': 6,     // Pausiert
      'paused': 6, // Pausiert (alt)
      
      // Dann Downloads mit Fehlern
      '1': 7,      // Platte voll
      '13': 8,     // Fehler beim Fertigstellen
      '15': 9,     // Abbrechen...
      
      // Dann abgebrochene Downloads
      '17': 10,    // Abgebrochen
      'failed': 10, // Abgebrochen (alt)
      
      // Dann fertige Downloads
      '14': 11,    // Fertig
      'completed': 11 // Fertig (alt)
    }
    
    // Hole die Priorität für jeden Status, oder setze auf 100 wenn unbekannt
    const priorityA = statusPriority[a.status] || 100
    const priorityB = statusPriority[b.status] || 100
    
    // Sortiere nach Priorität (aufsteigend)
    return priorityA - priorityB
  })
})

// Status-Farbe basierend auf Download-Status
const getStatusColor = (status) => {
  // Debug-Log für den Status
  console.log(`getStatusColor aufgerufen mit Status: ${status}`)
  
  switch (status) {
    // Aktive Downloads
    case '0':      return 'info'     // Suchen/Laden
    case '0_1':    return 'primary'  // Suchen
    case '0_2':    return 'info'     // Übertrage
    case '16':     return 'info'     // Erstelle .data
    case '12':     return 'info'     // Fertigstellen...
    
    // Fertige Downloads
    case '14':     return 'success'  // Fertig
    
    // Pausierte Downloads
    case '18':     return 'warning'  // Pausiert
    
    // Downloads mit Fehlern
    case '1':      return 'danger'   // Platte voll
    case '13':     return 'danger'   // Fehler beim Fertigstellen
    case '15':     return 'danger'   // Abbrechen...
    case '17':     return 'danger'   // Abgebrochen
        
    // Unbekannte Status-Codes
    default: return 'secondary'
  }
}

// Fortschrittsbalken-Farbe basierend auf Download-Status
const getProgressColor = (status) => {
  // Debug-Log für den Status
  console.log(`getProgressColor aufgerufen mit Status: ${status}`)
  
  switch (status) {
    // Aktive Downloads
    case '0':      return 'info'     // Suchen/Laden
    case '0_1':    return 'primary'  // Suchen
    case '0_2':    return 'info'     // Übertrage
    case '16':     return 'info'     // Erstelle .data
    case '12':     return 'info'     // Fertigstellen...
    
    // Fertige Downloads
    case '14':     return 'success'  // Fertig
    
    // Pausierte Downloads
    case '18':     return 'warning'  // Pausiert
    
    // Downloads mit Fehlern
    case '1':      return 'danger'   // Platte voll
    case '13':     return 'danger'   // Fehler beim Fertigstellen
    case '15':     return 'danger'   // Abbrechen...
    case '17':     return 'danger'   // Abgebrochen
    
    // Unbekannte Status-Codes
    default: return 'primary'  // Alle anderen Status
  }
}

// Status-Text auf Deutsch
const getStatusText = (status) => {
  switch (status) {
    // Hauptstatus
    case '0':      return 'Laden'
    case '0_1':    return 'Suchen'
    case '0_2':    return 'Übertrage'
    case '1':      return 'Platte voll'
    case '12':     return 'Fertigstellen...'
    case '13':     return 'Fehler beim Fertigstellen'
    case '14':     return 'Fertig'
    case '15':     return 'Abbrechen...'
    case '16':     return 'Erstelle .data'
    case '17':     return 'Abgebrochen'
    case '18':     return 'Pausiert'
        
    // Unbekannte Status-Codes
    default: return `Status: ${status}`
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

        // Extrahiere download-Elemente (für Status und andere Informationen)
        const downloadElements = xmlDoc.querySelectorAll('download')
        console.log('Found download elements:', downloadElements.length)
        
        // Debug: Zeige die Attribute der download-Elemente
        for (let i = 0; i < downloadElements.length; i++) {
          const download = downloadElements[i]
          console.log(`Download ${i}: id=${download.getAttribute('id')}, status=${download.getAttribute('status')}, filename=${download.getAttribute('filename')}`)
        }

        // Extrahiere user-Elemente
        const userElements = xmlDoc.querySelectorAll('user')
        console.log('Found user elements:', userElements.length)

        // Verarbeite download-Elemente direkt
        downloadElements.forEach(downloadElement => {
          const downloadId = downloadElement.getAttribute('id')
          if (!downloadId) return
          
          console.log(`Verarbeite Download-Element mit ID ${downloadId}`)
          
          // Extrahiere Informationen direkt aus dem download-Element
          const fileName = downloadElement.getAttribute('filename') || `Download ${downloadId}`
          const fileSize = parseInt(downloadElement.getAttribute('size') || '0')
          const downloadStatus = downloadElement.getAttribute('status') || '0'
          const powerDownload = parseInt(downloadElement.getAttribute('powerdownload') || '0')
          
          console.log(`Download ${downloadId}: fileName=${fileName}, status=${downloadStatus}, size=${fileSize}`)
          
          // Berechne den Fortschritt basierend auf dem Status
          let progress = 0;
          if (downloadStatus === '14') {
            // Fertige Downloads haben 100% Fortschritt
            progress = 100;
          } else {
            // Berechne den Fortschritt basierend auf den geladenen Bytes
            const loaded = parseInt(downloadElement.getAttribute('loaded') || '0')
            if (fileSize > 0) {
              progress = Math.round((loaded / fileSize) * 100)
            }
          }
          
          // Füge den Download direkt zur Liste hinzu
          downloadsList.push({
            id: downloadId,
            fileName: fileName,
            size: formatBytes(fileSize),
            rawSize: fileSize,
            progress: progress,
            status: downloadStatus,
            speed: downloadStatus === '14' ? '0 KB/s' : '...',
            eta: downloadStatus === '14' ? '--:--:--' : '...',
            sources: 1,
            powerdownload: powerDownload,
            loaded: parseInt(downloadElement.getAttribute('loaded') || '0'),
            rawData: { downloadId, downloadElement }
          })
        })
        
        // Verarbeite auch downloadid-Elemente für Abwärtskompatibilität
        downloadIdElements.forEach(downloadIdElement => {
          const downloadId = downloadIdElement.getAttribute('id')
          if (!downloadId) return
          
          // Überspringe Downloads, die bereits durch download-Elemente verarbeitet wurden
          if (downloadsList.some(d => d.id === downloadId)) {
            console.log(`Download ${downloadId} wurde bereits durch download-Element verarbeitet, überspringe`)
            return
          }

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
          // Beispiel für einen aktiven Download
          downloadsList.push({
            id: 'example1',
            fileName: 'Beispiel-Download.mp4',
            size: '1.5 GB',
            rawSize: 1500000000,
            progress: 35,
            status: '0_2', // Lade..
            speed: '1.2 MB/s',
            eta: '00:15:30',
            sources: 3,
            powerdownload: 2,
            loaded: 525000000,
            rawData: null
          })
          
          // Beispiel für einen fertigen Download
          downloadsList.push({
            id: 'example2',
            fileName: 'Supernatural.11x14.German.1080p.AC3.DL.HEVC.mkv',
            size: '950 MB',
            rawSize: 950397495,
            progress: 100,
            status: '14', // Fertig
            speed: '0 KB/s',
            eta: '--:--:--',
            sources: 1,
            powerdownload: 0,
            loaded: 950397495,
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
        status: '0_2',  // Lade..
        speed: '1.2 MB/s',
        eta: '00:15:30',
        sources: 3,
        powerdownload: 2,
        loaded: 525000000,
        rawData: null
      }]
    }
  }
}

// Hilfsfunktion: Bytes in lesbare Größe umwandeln
const formatBytes = (bytes, decimals = 2) => {
  // Sicherstellen, dass bytes eine positive Zahl ist
  const validBytes = Math.max(0, Number(bytes) || 0)

  if (validBytes === 0) return '0 B'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.min(Math.floor(Math.log(validBytes) / Math.log(k)), sizes.length - 1)

  return parseFloat((validBytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Hilfsfunktion: Sekunden in lesbare Zeit umwandeln
const formatTime = (seconds) => {
  // Sicherstellen, dass seconds eine positive Zahl ist
  const validSeconds = Number(seconds) || 0

  if (validSeconds <= 0) return '--:--:--'

  // Begrenze die Zeit auf maximal 99:59:59 (359999 Sekunden)
  const cappedSeconds = Math.min(validSeconds, 359999)

  const hours = Math.floor(cappedSeconds / 3600)
  const minutes = Math.floor((cappedSeconds % 3600) / 60)
  const secs = Math.floor(cappedSeconds % 60)

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

    // Status-Codes: 
    // '0', '0_1', '0_2', '12', '16', 'waiting', 'downloading' = Suchen/Laden/Aktiv
    // '14', 'completed' = Fertig
    // '18', 'paused' = Pausiert
    // '1', '13', '15', '17', 'failed' = Fehler/Abbruch

    if (download.status === '0' || download.status === '0_1' || download.status === '0_2' || 
        download.status === '12' || download.status === '16' ||
        download.status === 'waiting' || download.status === 'downloading') {
      // Download pausieren
      console.log(`Pausing download ${downloadId}...`)
      await coreService.command('text', 'function/pausedownload', { id: downloadId })

      // Status lokal aktualisieren (wird beim nächsten Refresh überschrieben)
      download.status = '18' // Pausiert
      download.speed = '0 KB/s'
      download.eta = '--:--:--'

      console.log(`Download ${downloadId} paused`)
    } else if (download.status === '18' || download.status === 'paused') {
      // Download fortsetzen
      console.log(`Resuming download ${downloadId}...`)
      await coreService.command('text', 'function/resumedownload', { id: downloadId })

      // Status lokal aktualisieren (wird beim nächsten Refresh überschrieben)
      download.status = '0_2' // Laden

      console.log(`Download ${downloadId} resumed`)
    }

    // Kurze Verzögerung, um dem Core Zeit zu geben, den Status zu aktualisieren
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Aktualisiere die Downloads-Liste
    await refreshDownloads()
  } catch (err) {
    error.value = `Fehler beim Pausieren/Fortsetzen des Downloads: ${err.message}`
    console.error('Error pausing/resuming download:', err)
    
    // Trotz Fehler die Liste aktualisieren, um den aktuellen Status zu sehen
    setTimeout(() => refreshDownloads(), 1000)
  }
}

// Download abbrechen
const cancelDownload = async (download) => {
  try {
    const downloadId = download.id

    console.log(`Cancelling download ${downloadId}...`)
    
    // Verwende 'text' statt 'function' für den Befehl, um Weiterleitungen zu vermeiden
    await coreService.command('text', 'function/canceldownload', { id: downloadId })
    
    // Kurze Verzögerung, um dem Core Zeit zu geben, den Download zu entfernen
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Aktualisiere die Downloads-Liste
    await refreshDownloads()
    
    // Lokal aus der Liste entfernen (wird beim nächsten Refresh aktualisiert)
    const index = downloads.value.findIndex(d => d.id === downloadId)
    if (index > -1) {
      downloads.value.splice(index, 1)
    }

    console.log(`Download ${downloadId} cancelled`)
  } catch (err) {
    error.value = `Fehler beim Abbrechen des Downloads: ${err.message}`
    console.error('Error cancelling download:', err)
    
    // Trotz Fehler die Liste aktualisieren, um den aktuellen Status zu sehen
    setTimeout(() => refreshDownloads(), 1000)
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

    // Eingabefeld zurücksetzen
    newDownloadUrl.value = ''
  } catch (err) {
    error.value = `Fehler beim Hinzufügen des Downloads: ${err.message}`
    console.error('Error adding download:', err)
  }
}

// Download umbenennen
const renameDownload = (download) => {
  try {
    const newName = prompt('Neuer Dateiname:', download.fileName)
    if (newName && newName !== download.fileName) {
      console.log(`Renaming download ${download.id} to ${newName}...`)
      // Hier würde die API-Anfrage zum Umbenennen erfolgen
      // Beispiel: await coreService.command('function', 'renamedownload', { id: download.id, name: newName })

      // Für jetzt nur lokale Aktualisierung
      download.fileName = newName
    }
  } catch (err) {
    error.value = `Fehler beim Umbenennen des Downloads: ${err.message}`
    console.error('Error renaming download:', err)
  }
}

// Download-Informationen anzeigen
const showDownloadInfo = async (download) => {
  try {
    console.log(`Showing info for download ${download.id}...`)

    // Setze den ausgewählten Download
    selectedDownload.value = download

    // Quellen-Arrays zurücksetzen
    activeSources.value = []
    queuedSources.value = []
    inactiveSources.value = []

    // Wenn rawData vorhanden ist, extrahiere die Quellen
    if (download.rawData && download.rawData.usersForDownload) {
      const sources = download.rawData.usersForDownload

      // Sortiere die Quellen nach Status
      sources.forEach(source => {
        // Berechne den Fortschritt für jede Quelle
        let sourceProgress = 0
        if (source.downloadedBytes && download.rawSize) {
          sourceProgress = Math.min(Math.round((source.downloadedBytes / download.rawSize) * 100), 100)
        } else if (source.actualPosition && download.rawSize) {
          sourceProgress = Math.min(Math.round((source.actualPosition / download.rawSize) * 100), 100)
        }

        // Füge berechneten Fortschritt hinzu
        const enhancedSource = {
          ...source,
          progress: sourceProgress
        }

        // Kategorisiere die Quellen basierend auf ihrem Status
        if (source.status === '7' || source.status === '8' || source.status === '9') {
          // Aktive Quellen (Übertragung)
          activeSources.value.push(enhancedSource)
        } else if (source.status === '15') {
          // Wartende Quellen (in der Warteschlange)
          queuedSources.value.push(enhancedSource)
        } else {
          // Inaktive Quellen (Rest)
          inactiveSources.value.push(enhancedSource)
        }
      })
    } else {
      // Wenn keine echten Daten vorhanden sind, erstelle Beispieldaten für die Vorschau
      if (process.env.NODE_ENV === 'development') {
        // Aktive Quellen
        activeSources.value = [
          {
            id: '1',
            nickname: 'user1',
            filename: download.fileName,
            speed: 7800,
            progress: 2.36,
            downloadedBytes: 11.66 * 1024 * 1024
          },
          {
            id: '2',
            nickname: 'user2',
            filename: download.fileName,
            speed: 7000,
            progress: 1.75,
            downloadedBytes: 14.16 * 1024 * 1024
          },
          {
            id: '3',
            nickname: 'anyone',
            filename: download.fileName.replace('.mkv', '.mp4'),
            speed: 7200,
            progress: 9.95,
            downloadedBytes: 4.1 * 1024 * 1024
          }
        ]

        // Inaktive Quellen
        inactiveSources.value = [
          {
            id: '4',
            nickname: '?',
            filename: '...',
            speed: 0,
            progress: 0,
            downloadedBytes: 0
          },
          {
            id: '5',
            nickname: '?',
            filename: '...',
            speed: 0,
            progress: 0,
            downloadedBytes: 0
          },
          {
            id: '6',
            nickname: 'K:-D',
            filename: download.fileName.replace('.mkv', '.mp4'),
            speed: 0,
            progress: 0,
            downloadedBytes: 4.1 * 1024 * 1024
          }
        ]
      }
    }

    // Öffne das Modal
    showInfoModal.value = true

  } catch (err) {
    error.value = `Fehler beim Anzeigen der Download-Informationen: ${err.message}`
    console.error('Error showing download info:', err)
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

// Intervall-Referenz außerhalb der Hooks definieren
let updateInterval = null

// Lifecycle hooks
onMounted(() => {
  console.log('Downloads view mounted')
  initializeData()

  // Auto-Update starten (alle 10 Sekunden)
  updateInterval = setInterval(refreshDownloads, 10000)
})





// Cleanup beim Unmount
onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
    updateInterval = null
  }
})
</script>
