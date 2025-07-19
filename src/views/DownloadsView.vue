<template>
  <AppLayout title="Dashboard v2">
    <div class="container-fluid py-4">
      <!-- Download Status Cards -->
      <div class="row g-3 mb-4">
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card bg-primary text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h6 class="card-title">Aktive Downloads</h6>
                  <h2 class="card-text">{{ downloadStats.active }}</h2>
                </div>
                <div class="align-self-center">
                  <i class="fa-solid fa-download fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card bg-success text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h6 class="card-title">Insgesamte Downloads</h6>
                  <h2 class="card-text">{{ downloadStats.total }}</h2>
                </div>
                <div class="align-self-center">
                  <i class="fas fa-list fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card bg-info text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h6 class="card-title">Abgeschlossene Downloads</h6>
                  <h2 class="card-text">{{ downloadStats.completed }}</h2>
                </div>
                <div class="align-self-center">
                  <i class="fas fa-check-circle fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card bg-warning text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h6 class="card-title">Wartende Downloads</h6>
                  <h2 class="card-text">{{ downloadStats.waiting }}</h2>
                </div>
                <div class="align-self-center">
                  <i class="fas fa-clock fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Download Details Section -->
      <div class="row g-3 mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-download me-2"></i>
                Download Übersicht
                <button 
                  @click="loadDownloadData" 
                  class="btn btn-outline-primary btn-sm ms-2"
                  :disabled="isLoading"
                >
                  <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': isLoading }"></i>
                  Aktualisieren
                </button>
                <button 
                  @click="toggleAutoRefresh" 
                  class="btn btn-sm ms-2"
                  :class="autoRefreshEnabled ? 'btn-success' : 'btn-outline-secondary'"
                >
                  <i class="fas fa-clock me-1"></i>
                  Auto-Refresh {{ autoRefreshEnabled ? 'AN' : 'AUS' }}
                </button>
                <small v-if="lastUpdated" class="text-muted ms-3">
                  Zuletzt aktualisiert: {{ lastUpdated.toLocaleTimeString() }}
                </small>
              </h5>
            </div>
            <div class="card-body">
              <div v-if="isLoading" class="text-center py-4">
                <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                Lade Download-Daten...
              </div>
              
              <div v-else-if="error" class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i>
                {{ error }}
                <button @click="loadDownloadData" class="btn btn-sm btn-outline-danger ms-2">
                  Erneut versuchen
                </button>
              </div>
              
              <div v-else-if="downloads.length === 0" class="text-center py-4 text-muted">
                <i class="fas fa-inbox fa-3x mb-3"></i>
                <p>Keine Downloads gefunden</p>
              </div>
              
              <div v-else>
                <!-- Download-Aktionsbuttons -->
                <div class="mb-3 d-flex gap-2 flex-wrap">
                  <button 
                    class="btn btn-outline-secondary text-warning" 
                    type="button" 
                    @click="downloadAction('pausedownload')"
                    :disabled="selectedDownloads.length === 0"
                    title="Downloads pausieren">
                    <i class="fa fa-circle-pause"></i>
                  </button>
                  
                  <button 
                    class="btn btn-outline-secondary text-success" 
                    type="button" 
                    @click="downloadAction('resumedownload')"
                    :disabled="selectedDownloads.length === 0"
                    title="Downloads fortsetzen">
                    <i class="fa fa-circle-play"></i>
                  </button>
                  
                  <button 
                    class="btn btn-outline-secondary text-danger" 
                    type="button" 
                    @click="downloadAction('canceldownload')"
                    :disabled="selectedDownloads.length === 0"
                    title="Downloads abbrechen">
                    <i class="fa fa-times"></i>
                  </button>
                  
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button" 
                    @click="downloadAction('settargetdir')"
                    :disabled="selectedDownloads.length === 0"
                    title="Zielverzeichnis ändern">
                    <i class="fa fa-folder"></i>
                  </button>
                  
                  <button 
                    class="btn btn-outline-secondary text-danger" 
                    type="button" 
                    @click="cleanDownloadList()"
                    title="Download-Liste bereinigen">
                    <i class="fa fa-trash"></i>
                  </button>
                  
                  <div class="ms-auto">
                    <small class="text-muted">
                      {{ selectedDownloads.length }} von {{ downloads.length }} Downloads ausgewählt
                    </small>
                  </div>
                </div>
                
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th>
                          <input 
                            type="checkbox" 
                            class="form-check-input" 
                            @change="toggleAllDownloads"
                            :checked="allDownloadsSelected"
                          >
                        </th>
                        <th>Dateiname</th>
                        <th>Status</th>
                        <th>Fortschritt</th>
                        <th>PDL</th>
                        <th>Geschwindigkeit</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="download in downloads" :key="download.id">
                        <td>
                          <input 
                            type="checkbox" 
                            class="form-check-input" 
                            v-model="selectedDownloads"
                            :value="download.id"
                          >
                        </td>
                        <td>
                          <div class="d-flex align-items-center">
                            <i class="fas fa-file me-2 text-muted"></i>
                            <div>
                              <div class="fw-bold">{{ download.filename }}</div>
                              <small class="text-muted">{{ getFileSizeAndPart(download) }}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span :class="getStatusBadgeClass(download.status)">
                            {{ download.status }}
                          </span>
                        </td>
                        <td>
                          <div class="d-flex justify-content-between align-items-baseline">
                            <div class="fw-semibold">{{ download.progress }}%</div>
                            <div class="text-nowrap small text-body-secondary ms-3">
                              {{ getRemainingBytes(download) }} - {{ formatTime(download.remainingTime) }}
                            </div>
                          </div>
                          <div class="progress progress-thin">
                            <div 
                              class="progress-bar" 
                              :class="getProgressBarClass(download.status)"
                              :style="{ width: download.progress + '%' }"
                              role="progressbar"
                              :aria-valuenow="download.progress"
                              aria-valuemin="0"
                              aria-valuemax="100">
                            </div>
                          </div>
                        </td>
                        <td>
                          <span class="badge" :class="getPDLBadgeClass(download)">
                            {{ getPDLStatus(download) }}
                          </span>
                        </td>
                        <td>{{ formatSpeed(download.speed) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Debug Information -->
      <div class="row" v-if="showDebug">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-bug me-2"></i>
                Debug Information
              </h5>
            </div>
            <div class="card-body">
              <h6>Raw XML Data:</h6>
              <pre class="bg-light p-3 rounded" style="max-height: 300px; overflow: auto;">{{ xmlData }}</pre>
              
              <h6 class="mt-3">Parsed Downloads:</h6>
              <pre class="bg-light p-3 rounded" style="max-height: 300px; overflow: auto;">{{ JSON.stringify(downloads, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { 
  loadModified,
  parseXml, 
  getXmlElements,
  formatBytes,
  formatSpeed,
  formatTime
} from '@/utils/api'
import AppLayout from '@/components/AppLayout.vue'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const downloadStats = ref({
  active: 0,
  total: 0,
  completed: 0,
  waiting: 0
})

const downloads = ref<any[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const xmlData = ref<string>('')
const showDebug = ref(false) // Für Entwicklungszwecke
const autoRefreshInterval = ref<number | null>(null)
const autoRefreshEnabled = ref(true)
const lastUpdated = ref<Date | null>(null)
const selectedDownloads = ref<string[]>([])
const allDownloadsSelected = ref(false)

interface Download {
  id: string
  filename: string
  size: number
  status: string
  progress: number
  speed: number
  remainingTime: number
  priority: number
  hash?: string
  pdlActive?: boolean
  pdlValue?: number // Der rohe powerdownload Wert für spätere Umrechnung
}

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    'Gestoppt': 'badge bg-secondary',
    'Wartend': 'badge bg-warning',
    'Abgebrochen': 'bg-warning',
    'Lädt...': 'badge bg-info',
    'Aktiv': 'badge bg-info',
    'Abgeschlossen': 'badge bg-success',
    'Unbekannt': 'badge bg-secondary'
  }
  return classes[status] || 'badge bg-secondary'
}

const getProgressBarClass = (status: string) => {
  const classes: Record<string, string> = {
    'Gestoppt': 'bg-secondary',
    'Wartend': 'bg-warning',
    'Abgebrochen': 'bg-warning',
    'Lädt...': 'bg-info',
    'Aktiv': 'bg-info',
    'Abgeschlossen': 'bg-success',
    'Unbekannt': 'bg-secondary'
  }
  return classes[status] || 'bg-secondary'
}

const getPriorityBadgeClass = (priority: number) => {
  if (priority >= 8) return 'bg-danger'
  if (priority >= 6) return 'bg-warning'
  if (priority >= 4) return 'bg-info'
  return 'bg-secondary'
}

const getPDLStatus = (download: Download) => {
  // PDL Status basierend auf powerdownload Attribut
  if (download.pdlActive === true) {
    if (download.pdlValue !== undefined) {
      const calculatedValue = (download.pdlValue + 10) / 10
      return `${calculatedValue.toFixed(1)}`
    }
    return 'Aktiv'
  } else {
    if (download.pdlValue !== undefined) {
      const calculatedValue = (download.pdlValue + 10) / 10
      return `Inaktiv`
    }
    return 'Inaktiv'
  }
}

const getPDLBadgeClass = (download: Download) => {
  if (download.pdlActive === true) {
    return 'bg-success'
  } else if (download.pdlActive === false) {
    return 'bg-secondary'
  }
  return 'bg-info'
}

// Extrahiert Part-Nummer aus dem Dateinamen (nur die Nummer)
const extractPartNumber = (filename: string): number | null => {
  if (!filename) return null
  
  // Suche nach "part" gefolgt von Zahlen (case-insensitive)
  const partMatch = filename.match(/part\s*(\d+)/i)
  if (partMatch) {
    return parseInt(partMatch[1], 10)
  }
  
  // Suche nach "pt" gefolgt von Zahlen
  const ptMatch = filename.match(/pt\s*(\d+)/i)
  if (ptMatch) {
    return parseInt(ptMatch[1], 10)
  }
  
  // Suche nach "p" gefolgt von Zahlen (nur wenn es isoliert steht)
  const pMatch = filename.match(/\bp\s*(\d+)/i)
  if (pMatch) {
    return parseInt(pMatch[1], 10)
  }
  
  // Suche nach Zahlen in Klammern oder mit Bindestrichen
  const bracketMatch = filename.match(/[\(\[\-_]\s*(\d+)\s*[\)\]\-_]/i)
  if (bracketMatch) {
    return parseInt(bracketMatch[1], 10)
  }
  
  // Suche nach CD/DVD Nummern
  const cdMatch = filename.match(/cd\s*(\d+)/i)
  if (cdMatch) {
    return parseInt(cdMatch[1], 10)
  }
  
  // Fallback: Suche nach isolierten Zahlen am Ende des Namens
  const endNumberMatch = filename.match(/(\d+)(?:\.[^.]*)?$/i)
  if (endNumberMatch && endNumberMatch[1].length <= 3) {
    return parseInt(endNumberMatch[1], 10)
  }
  
  return null
}

// Erstellt die Anzeige: Dateigröße | Part: X (nur wenn Part gefunden)
const getFileSizeAndPart = (download: Download): string => {
  const sizeText = formatBytes(download.size)
  const partNumber = extractPartNumber(download.filename)
  
  if (partNumber !== null) {
    return `${sizeText} | Part: ${partNumber}`
  }
  
  return sizeText
}

const parseDownloadXml = (xmlContent: string): Download[] => {
  try {
    const xmlDoc = parseXml(xmlContent)
    
    // Suche nach 'download' Elementen
    const downloadElements = getXmlElements(xmlDoc, 'download')
    console.log(`Gefunden: ${downloadElements.length} Download-Elemente`)
    
    if (downloadElements.length === 0) {
      console.log('XML-Struktur Debug:')
      console.log('Root Element:', xmlDoc.documentElement?.tagName)
      console.log('Erste 5 Kindelemente:', Array.from(xmlDoc.documentElement?.children || []).slice(0, 5).map(el => el.tagName))
    }
    
    const parsedDownloads: Download[] = []
    
    downloadElements.forEach((element, index) => {
      try {
        // Extrahiere Attribute basierend auf der AppleJuice XML-Struktur
        const id = element.getAttribute('id') || `download_${index}`
        const hash = element.getAttribute('hash') || ''
        const filename = element.getAttribute('filename') || 'Unbekannte Datei'
        const size = parseInt(element.getAttribute('size') || '0', 10)
        const statusCode = parseInt(element.getAttribute('status') || '0', 10)
        const powerdownload = parseInt(element.getAttribute('powerdownload') || '0', 10)
        const ready = parseInt(element.getAttribute('ready') || '0', 10)
        
        // Status-Code zu lesbarem Status konvertieren
        const status = getStatusFromCode(statusCode)
        
        // Fortschritt berechnen
        let progress = 0
        if (statusCode === 14) { // Fertig
          progress = 100
        } else if (ready > 0 && size > 0) {
          progress = Math.round((ready / size) * 100)
        }
        
        // PDL Status: PDL ist erst ab einem Wert von 12 aktiv (entspricht 2.2)
        // 0 = Inaktiv, >= 12 = Aktiv
        const pdlActive = powerdownload >= 12
        
        // Geschwindigkeit und verbleibende Zeit (nicht in XML verfügbar, auf 0 setzen)
        const speed = 0
        const remainingTime = 0
        
        // Priorität (nicht in XML verfügbar, Standard setzen)
        const priority = 5
        
        parsedDownloads.push({
          id,
          filename,
          size,
          status,
          progress,
          speed,
          remainingTime,
          priority,
          hash,
          pdlActive,
          pdlValue: powerdownload
        })
        
        console.log(`Download ${index + 1}: ${filename} (Status: ${status}, ${formatBytes(size)}, ${progress}%, PDL: ${pdlActive ? 'Aktiv' : 'Inaktiv'})`)
      } catch (parseError) {
        console.error(`Fehler beim Parsen von Download ${index}:`, parseError)
        console.log('Element Attribute:', {
          id: element.getAttribute('id'),
          filename: element.getAttribute('filename'),
          size: element.getAttribute('size'),
          status: element.getAttribute('status'),
          powerdownload: element.getAttribute('powerdownload')
        })
      }
    })
    
    // Falls keine Downloads gefunden, erstelle Test-Daten basierend auf der echten Struktur
    if (parsedDownloads.length === 0) {
      console.log('Keine Downloads in XML gefunden, erstelle Test-Daten...')
      parsedDownloads.push(
        {
          id: '1',
          filename: 'Game.of.Thrones.S08E06.part01.1080p.BluRay.x264.mkv',
          size: 1103009546, // ~1.1 GB wie im Beispiel
          status: 'Aktiv',
          progress: 65.5,
          speed: 1024 * 512, // 512 KB/s
          remainingTime: 180,
          priority: 5,
          hash: '5bf589f30237db12255227e627716347',
          pdlActive: true, // powerdownload >= 12
          pdlValue: 15 // Beispiel: 15 entspricht ~2.7
        },
        {
          id: '2',
          filename: 'The.Matrix.Trilogy.part03.2160p.UHD.BluRay.x265.mkv',
          size: 2500000000, // ~2.5 GB
          status: 'Wartend',
          progress: 0,
          speed: 0,
          remainingTime: 0,
          priority: 3,
          hash: 'abcd1234567890abcd1234567890abcd',
          pdlActive: false, // powerdownload < 12
          pdlValue: 8 // Beispiel: 8 entspricht ~1.4
        },
        {
          id: '3',
          filename: 'Supernatural.10x23.German.1080p.AC3.DL.HEVC.mkv',
          size: 1103009546,
          status: 'Abgeschlossen',
          progress: 100,
          speed: 0,
          remainingTime: 0,
          priority: 7,
          hash: '5bf589f30237db12255227e627716347',
          pdlActive: false, // powerdownload = 0 (inaktiv)
          pdlValue: 0
        },
        {
          id: '4',
          filename: 'Avengers.Endgame.2019.pt2.4K.HDR.mkv',
          size: 3500000000, // ~3.5 GB
          status: 'Lädt...',
          progress: 5.2,
          speed: 1024 * 256, // 256 KB/s
          remainingTime: 3600,
          priority: 8,
          hash: 'def456789012345678901234567890ab',
          pdlActive: true,
          pdlValue: 20
        }
      )
    }
    
    return parsedDownloads
  } catch (error) {
    console.error('Fehler beim Parsen der Download-XML:', error)
    console.log('XML Content Preview:', xmlContent.substring(0, 1000))
    throw error
  }
}

// Hilfsfunktion zur Konvertierung von Status-Codes
const getStatusFromCode = (statusCode: number): string => {
  const statusMap: Record<number, string> = {
    0: 'Suchen',
    1: 'Wartend', // 0_1
    2: 'Lädt...', // 0_2
    7: 'Aktiv',
    8: 'Aktiv',
    9: 'Aktiv',
    14: 'Abgeschlossen',
    15: 'Wartend',
    17: 'Abgebrochen'
  }
  return statusMap[statusCode] || 'Unbekannt'
}

const calculateStats = (downloads: Download[]) => {
  const stats = {
    active: 0,
    total: downloads.length,
    completed: 0,
    waiting: 0
  }
  
  downloads.forEach(download => {
    switch (download.status) {
      case 'Aktiv':
      case 'Lädt...':
        stats.active++
        break
      case 'Abgeschlossen':
        stats.completed++
        break
      case 'Wartend':
      case 'Gestoppt':
        stats.waiting++
        break
    }
  })
  
  return stats
}

const loadDownloadData = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    console.log('Lade modified.xml...')
    
    // Lade die modified.xml Datei
    const xmlContent = await loadModified()
    xmlData.value = xmlContent
    
    console.log(`XML geladen: ${xmlContent.length} Zeichen`)
    console.log('XML Vorschau:', xmlContent.substring(0, 500))
    
    // Parse die Downloads
    const parsedDownloads = parseDownloadXml(xmlContent)
    downloads.value = parsedDownloads
    
    // Berechne Statistiken
    downloadStats.value = calculateStats(parsedDownloads)
    
    // Aktualisiere Zeitstempel
    lastUpdated.value = new Date()
    
    console.log('Download-Statistiken:', downloadStats.value)
    
  } catch (err) {
    console.error('Fehler beim Laden der Download-Daten:', err)
    error.value = err instanceof Error ? err.message : 'Unbekannter Fehler beim Laden der Download-Daten'
  } finally {
    isLoading.value = false
  }
}

// Toggle Debug-Anzeige (für Entwicklung)
const toggleDebug = () => {
  showDebug.value = !showDebug.value
}

// Auto-Refresh Funktionen
const startAutoRefresh = () => {
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value)
  }
  
  if (autoRefreshEnabled.value) {
    autoRefreshInterval.value = setInterval(() => {
      if (!isLoading.value) {
        loadDownloadData()
      }
    }, 5000) // Alle 5 Sekunden aktualisieren
  }
}

const stopAutoRefresh = () => {
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value)
    autoRefreshInterval.value = null
  }
}

const toggleAutoRefresh = () => {
  autoRefreshEnabled.value = !autoRefreshEnabled.value
  if (autoRefreshEnabled.value) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

// Keyboard shortcut für Debug-Toggle
const handleKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey && event.shiftKey && event.key === 'D') {
    toggleDebug()
  }
}

// Checkbox-Funktionen
const toggleAllDownloads = () => {
  if (allDownloadsSelected.value) {
    selectedDownloads.value = []
    allDownloadsSelected.value = false
  } else {
    selectedDownloads.value = downloads.value.map(download => download.id)
    allDownloadsSelected.value = true
  }
}

// Funktion für verbleibende Bytes
const getRemainingBytes = (download: any) => {
  if (!download.size || !download.progress) {
    return '0 B'
  }
  
  const totalBytes = download.size
  const completedBytes = (totalBytes * download.progress) / 100
  const remainingBytes = totalBytes - completedBytes
  
  return formatBytes(remainingBytes)
}

// Download-Aktionen
const downloadAction = async (action: string) => {
  if (selectedDownloads.value.length === 0) {
    alert('Bitte wählen Sie mindestens einen Download aus.')
    return
  }

  try {
    let actionUrl = ''
    let actionParams = new URLSearchParams()
    
    // IDs der ausgewählten Downloads hinzufügen
    selectedDownloads.value.forEach((id, index) => {
      if (index === 0) {
        actionParams.append('id', id)
      } else {
        actionParams.append(`id${index}`, id)
      }
    })

    switch (action) {
      case 'pausedownload':
        actionUrl = 'pausedownload'
        break
      case 'resumedownload':
        actionUrl = 'resumedownload'
        break
      case 'canceldownload':
        if (!confirm('Möchten Sie die ausgewählten Downloads wirklich abbrechen?')) {
          return
        }
        actionUrl = 'canceldownload'
        break
      case 'settargetdir':
        const newDir = prompt('Neues Zielverzeichnis eingeben:')
        if (!newDir) return
        actionUrl = 'settargetdir'
        actionParams.append('dir', encodeURIComponent(newDir))
        break
      default:
        console.error('Unbekannte Aktion:', action)
        return
    }

    // API-Aufruf (hier müssen Sie die entsprechende API-Funktion implementieren)
    console.log(`Führe Aktion ${action} für Downloads aus:`, selectedDownloads.value)
    console.log('URL:', actionUrl)
    console.log('Parameter:', actionParams.toString())
    
    // Hier würde der tatsächliche API-Aufruf stehen:
    // await performDownloadAction(actionUrl, actionParams.toString())
    
    // Nach erfolgreicher Aktion Downloads neu laden
    await loadDownloadData()
    
    // Auswahl zurücksetzen
    selectedDownloads.value = []
    allDownloadsSelected.value = false
    
  } catch (error) {
    console.error('Fehler bei Download-Aktion:', error)
    alert('Fehler beim Ausführen der Aktion. Bitte versuchen Sie es erneut.')
  }
}

// Download-Liste bereinigen
const cleanDownloadList = async () => {
  if (!confirm('Möchten Sie die Download-Liste wirklich bereinigen? Dies entfernt abgeschlossene und abgebrochene Downloads.')) {
    return
  }

  try {
    console.log('Bereinige Download-Liste...')
    
    // Hier würde der API-Aufruf für die Bereinigung stehen:
    // await cleanDownloads()
    
    // Downloads neu laden
    await loadDownloadData()
    
  } catch (error) {
    console.error('Fehler beim Bereinigen der Download-Liste:', error)
    alert('Fehler beim Bereinigen der Download-Liste. Bitte versuchen Sie es erneut.')
  }
}

onMounted(() => {
  // Überprüfen ob der Benutzer authentifiziert ist
  if (!authStore.isAuthenticated) {
    router.push('/login')
  } else {
    // Lade Download-Daten bei der Initialisierung
    loadDownloadData()
    
    // Starte Auto-Refresh
    startAutoRefresh()
    
    // Event-Listener für Debug-Toggle
    document.addEventListener('keydown', handleKeydown)
  }
})

// Cleanup
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  stopAutoRefresh()
})
</script>

<style scoped>
.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transition: all 0.3s ease;
  border-radius: 12px;
}

.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-body {
  padding: 1.5rem;
}

.bg-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.bg-success {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%) !important;
}

.bg-info {
  background: linear-gradient(135deg, #17a2b8 0%, #7fcdcd 100%) !important;
}

.bg-warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
}

.progress {
  height: 20px;
  border-radius: 10px;
  background-color: #e9ecef;
}

.progress-bar {
  border-radius: 10px;
  transition: width 0.6s ease;
}

.table-responsive {
  border-radius: 8px;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
  background-color: #f8f9fa;
}

.table td {
  vertical-align: middle;
}

.badge {
  font-size: 0.8rem;
  padding: 0.4em 0.6em;
}

pre {
  font-size: 0.875rem;
  line-height: 1.4;
}

/* Animation für Spinning-Icon */
.fa-spin {
  animation: fa-spin 2s infinite linear;
}

@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>