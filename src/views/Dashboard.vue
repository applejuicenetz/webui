<template>
  <AppLayout>
    <div class="container-lg px-4">
      <div class="row">
        <!-- Left Column -->
        <div class="col-12 col-md-6">
          <div class="mb-3">
            <div class="row g-4">
              <!-- Downloads -->
              <div class="col-6 col-lg-6 col-xl-4">
                <div class="card shadow-sm">
                  <div class="card-body">
                    <div class="text-muted text-end">
                      <i class="bi bi-cloud-download fs-1"></i>
                    </div>
                    <div class="fs-4 fw-bold">{{ dashboardData.downloads.active }}/{{ dashboardData.downloads.total }}</div>
                    <div class="small text-muted text-uppercase fw-semibold">Downloads</div>
                    <div class="progress mt-3" style="height: 4px;">
                      <div class="progress-bar bg-info" role="progressbar" :style="`width: ${dashboardData.downloads.progress}%`"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Uploads -->
              <div class="col-6 col-lg-6 col-xl-4">
                <div class="card shadow-sm">
                  <div class="card-body">
                    <div class="text-muted text-end">
                      <i class="bi bi-cloud-upload fs-1"></i>
                    </div>
                    <div class="fs-4 fw-bold">{{ dashboardData.uploads.active }}</div>
                    <div class="small text-muted text-uppercase fw-semibold">Uploads</div>
                    <div class="progress mt-3" style="height: 4px;">
                      <div class="progress-bar bg-success" role="progressbar" :style="`width: ${dashboardData.uploads.progress}%`"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Shared Files -->
              <div class="col-6 col-lg-6 col-xl-4">
                <div class="card shadow-sm">
                  <div class="card-body">
                    <div class="text-muted text-end">
                      <i class="bi bi-folder2-open fs-1"></i>
                    </div>
                    <div class="fs-4 fw-bold">{{ dashboardData.sharedFiles.size }}</div>
                    <div class="small text-muted text-uppercase fw-semibold">{{ dashboardData.sharedFiles.count }} Dateien</div>
                    <div class="progress mt-3" style="height: 4px;">
                      <div class="progress-bar bg-warning" role="progressbar" :style="`width: ${dashboardData.sharedFiles.progress}%`"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Credits -->
              <div class="col-6 col-lg-6 col-xl-4">
                <div class="card shadow-sm">
                  <div class="card-body">
                    <div class="text-muted text-end">
                      <i class="bi bi-bank fs-1"></i>
                    </div>
                    <div class="fs-4 fw-bold">
                      <span :class="dashboardData.credits.value.startsWith('-') ? 'text-danger' : 'text-success'">
                        {{ dashboardData.credits.value }}
                      </span>
                    </div>
                    <div class="small text-muted text-uppercase fw-semibold">Punkte</div>
                  </div>
                </div>
              </div>

              <!-- Server -->
              <div class="col-6 col-lg-6 col-xl-8">
                <div class="card shadow-sm">
                  <div class="card-body">
                    <div class="text-muted text-end">
                      <i class="bi bi-server fs-1"></i>
                    </div>
                    <div class="fs-4 fw-bold">{{ dashboardData.server.name }}</div>
                    <div class="small">
                      <strong>{{ dashboardData.server.description }}</strong><br />
                      aktuelle <strong>Setups</strong> unter <strong>{{ dashboardData.server.website }}</strong>
                    </div>
                    <div class="small text-muted text-uppercase fw-semibold text-end mt-2">
                      verbunden seit {{ dashboardData.server.connectedSince }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Traffic Section -->
          <div class="row">
            <div class="col-12">
              <div class="card shadow-sm mb-3">
                <div class="card-body">
                  <h5 class="card-title fw-bold mb-4">
                    <i class="bi bi-graph-up me-2"></i>
                    Traffic
                  </h5>
                  <div class="row">
                    <div class="col-12 col-lg-4">
                      <div class="border-start border-4 border-info ps-3 mb-3">
                        <div class="small text-muted">Heute</div>
                        <div class="fs-5 fw-bold">{{ dashboardData.traffic.today }}</div>
                      </div>
                    </div>
                    <div class="col-12 col-lg-4">
                      <div class="border-start border-4 border-info ps-3 mb-3">
                        <div class="small text-muted">Gestern</div>
                        <div class="fs-5 fw-bold">{{ dashboardData.traffic.yesterday }}</div>
                      </div>
                    </div>
                    <div class="col-12 col-lg-4">
                      <div class="border-start border-4 border-info ps-3 mb-3">
                        <div class="small text-muted">Monat</div>
                        <div class="fs-5 fw-bold">{{ dashboardData.traffic.month }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="col-12 col-md-6">
          <div class="card shadow-sm mb-3">
            <div class="card-body">
              <h5 class="card-title fw-bold mb-4">
                <i class="bi bi-cpu me-2"></i>
                Core Informationen
              </h5>
              <div class="row">
                <div class="col-12 col-lg-4">
                  <div class="border-start border-4 border-info ps-3 mb-3">
                    <div class="small text-muted">Server Zeit</div>
                    <div class="fs-6 fw-bold">{{ dashboardData.core.serverTime }}</div>
                  </div>
                </div>
                <div class="col-12 col-lg-4">
                  <div class="border-start border-4 border-info ps-3 mb-3">
                    <div class="small text-muted">Core-Version</div>
                    <div class="fs-6 fw-bold">{{ dashboardData.core.version }}</div>
                  </div>
                </div>
                <div class="col-12 col-lg-4">
                  <div class="border-start border-4 border-info ps-3 mb-3">
                    <div class="small text-muted">Betriebssystem</div>
                    <div class="fs-6 fw-bold">
                      <img width="16" height="16" :src="dashboardData.core.osIcon" :alt="dashboardData.core.osName"/>
                      {{ dashboardData.core.osName }}
                    </div>
                  </div>
                </div>
              </div>

              <h5 class="card-title fw-bold mb-4 mt-4">
                <i class="bi bi-wifi me-2"></i>
                Netzwerk Informationen
              </h5>
              <div class="row">
                <div class="col-12 col-lg-6">
                  <div class="border-start border-4 border-warning ps-3 mb-3">
                    <div class="small text-muted">Verbindungen</div>
                    <div class="fs-6 fw-bold">{{ dashboardData.network.connections }}</div>
                  </div>
                </div>
                <div class="col-12 col-lg-6">
                  <div class="border-start border-4 border-warning ps-3 mb-3">
                    <div class="small text-muted">Download</div>
                    <div class="fs-6 fw-bold">{{ dashboardData.network.download }}</div>
                  </div>
                </div>
                <div class="col-12 col-lg-6">
                  <div class="border-start border-4 border-warning ps-3 mb-3">
                    <div class="small text-muted">Upload</div>
                    <div class="fs-6 fw-bold">{{ dashboardData.network.upload }}</div>
                  </div>
                </div>
                <div class="col-12 col-lg-6">
                  <div class="border-start border-4 border-warning ps-3 mb-3">
                    <div class="small text-muted">Bytes in</div>
                    <div class="fs-6 fw-bold">{{ dashboardData.network.bytesIn }}</div>
                  </div>
                </div>
                <div class="col-12 col-lg-6">
                  <div class="border-start border-4 border-warning ps-3 mb-3">
                    <div class="small text-muted">Bytes out</div>
                    <div class="fs-6 fw-bold">{{ dashboardData.network.bytesOut }}</div>
                  </div>
                </div>
              </div>

              <h5 class="card-title fw-bold mb-4 mt-4">
                <i class="bi bi-people me-2"></i>
                Community
              </h5>
              <div class="row">
                <div class="col-12 col-lg-4">
                  <div class="border-start border-4 border-success ps-3 mb-3">
                    <div class="small text-muted">Shared User</div>
                    <div class="fs-6 fw-bold">{{ dashboardData.community.sharedUsers }}</div>
                  </div>
                </div>
                <div class="col-12 col-lg-8">
                  <div class="border-start border-4 border-success ps-3 mb-3">
                    <div class="small text-muted">gesamte Dateien</div>
                    <div class="fs-6 fw-bold">{{ dashboardData.community.totalFiles }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { 
  loadInformation, 
  loadAllXmlData, 
  loadAndParseAllXml,
  loadXmlData,
  parseXml, 
  getXmlValue 
} from '@/utils/api'
import AppLayout from '@/components/AppLayout.vue'

const router = useRouter()
const authStore = useAuthStore()

const dashboardData = ref({
  downloads: {
    active: 0,
    total: 0,
    progress: 0
  },
  uploads: {
    active: 0,
    progress: 0
  },
  sharedFiles: {
    size: '639.85 GB',
    count: 763,
    progress: 0
  },
  credits: {
    value: '-2.95 GB'
  },
  server: {
    name: 'aj-server.ddnss.de',
    description: '..::aj-Server::.. appleJuiceNET.cc',
    website: 'https://applejuicenet.cc/',
    connectedSince: '17h 16min'
  },
  traffic: {
    today: 8,
    yesterday: 3,
    month: 713
  },
  core: {
    serverTime: '13.7.25 - 21:43:01',
    version: '0.31.149.113',
    osName: 'Linux',
    osIcon: 'themes/icons/os_linux.svg'
  },
  network: {
    connections: '1 / 500',
    download: '0 B',
    upload: '0 B',
    bytesIn: '31.54 GB',
    bytesOut: '14.60 GB'
  },
  community: {
    sharedUsers: 476,
    totalFiles: '3,756,929 (1.22 PB)'
  }
})

const isLoading = ref(false)
const error = ref<string | null>(null)

const loadDashboardData = async () => {
  isLoading.value = true
  error.value = null

  try {
    // Lade Informationen vom Core-Server
    const xmlData = await loadInformation()
    const xmlDoc = parseXml(xmlData)
    
    // Extrahiere relevante Informationen und aktualisiere Dashboard-Daten
    const uploadCount = getXmlValue(xmlDoc, 'uploads') || '0'
    dashboardData.value.uploads.active = parseInt(uploadCount, 10)
    
    // Weitere Daten aus XML extrahieren falls verfügbar
    const serverName = getXmlValue(xmlDoc, 'servername') || dashboardData.value.server.name
    dashboardData.value.server.name = serverName
    
    // Core-Version aus information.xml extrahieren
    const coreVersion = getXmlValue(xmlDoc, 'version')
    if (coreVersion) {
      dashboardData.value.core.version = coreVersion
    }
    
    // Betriebssystem aus information.xml extrahieren
    const systemInfo = getXmlValue(xmlDoc, 'system')
    if (systemInfo) {
      dashboardData.value.core.osName = systemInfo
      // Icon basierend auf Betriebssystem setzen
      if (systemInfo.toLowerCase().includes('windows')) {
        dashboardData.value.core.osIcon = 'themes/icons/os_windows.svg'
      } else if (systemInfo.toLowerCase().includes('linux')) {
        dashboardData.value.core.osIcon = 'themes/icons/os_linux.svg'
      } else if (systemInfo.toLowerCase().includes('mac')) {
        dashboardData.value.core.osIcon = 'themes/icons/os_mac.svg'
      } else {
        dashboardData.value.core.osIcon = 'themes/icons/os_unknown.svg'
      }
    }
    
    // Server-Zeit aktualisieren
    dashboardData.value.core.serverTime = new Date().toLocaleString('de-DE')
    
    // Lade modified.xml um Downloads zu zählen
    try {
      const modifiedXmlData = await loadXmlData('modified.xml')
      const modifiedXmlDoc = parseXml(modifiedXmlData)
      
      // Zähle alle <downloadid> Elemente in der modified.xml
      const downloadElements = modifiedXmlDoc.getElementsByTagName('downloadid')
      const totalDownloads = downloadElements.length
      
      // Zähle aktive Downloads (die einen Wert haben)
      let activeDownloads = 0
      for (let i = 0; i < downloadElements.length; i++) {
        const downloadId = downloadElements[i].textContent?.trim()
        if (downloadId && downloadId !== '') {
          activeDownloads++
        }
      }
      
      dashboardData.value.downloads.active = activeDownloads
      dashboardData.value.downloads.total = totalDownloads
      
      // Berechne Progress (aktive Downloads / gesamte Downloads * 100)
      if (totalDownloads > 0) {
        dashboardData.value.downloads.progress = Math.round((activeDownloads / totalDownloads) * 100)
      } else {
        dashboardData.value.downloads.progress = 0
      }
      
      console.log(`Downloads gefunden: ${activeDownloads}/${totalDownloads} (${dashboardData.value.downloads.progress}%)`)
      
      // Extrahiere Credits aus <information credits="..."> Attribut
      const informationElements = modifiedXmlDoc.getElementsByTagName('information')
      if (informationElements.length > 0) {
        const creditsAttr = informationElements[0].getAttribute('credits')
        if (creditsAttr) {
          const creditsBytes = parseInt(creditsAttr, 10)
          if (!isNaN(creditsBytes)) {
            // Konvertiere Credits von Bytes zu lesbarer Form
            dashboardData.value.credits.value = formatFileSize(creditsBytes)
            console.log(`Credits gefunden: ${creditsBytes} Bytes = ${dashboardData.value.credits.value}`)
          }
        }
      }
      
    } catch (modifiedError) {
      console.error('Fehler beim Laden der modified.xml:', modifiedError)
      // Fallback auf information.xml Werte
      const downloadCount = getXmlValue(xmlDoc, 'downloads') || '0'
      dashboardData.value.downloads.active = parseInt(downloadCount, 10)
      dashboardData.value.downloads.total = parseInt(downloadCount, 10)
    }
    
    // Lade share.xml um geteilte Dateien zu analysieren
    try {
      const shareXmlData = await loadXmlData('share.xml')
      const shareXmlDoc = parseXml(shareXmlData)
      
      // Finde alle <share> Elemente mit size Attribut
      const shareElements = shareXmlDoc.getElementsByTagName('share')
      let totalSize = 0
      let fileCount = 0
      
      for (let i = 0; i < shareElements.length; i++) {
        const sizeAttr = shareElements[i].getAttribute('size')
        if (sizeAttr) {
          const fileSize = parseInt(sizeAttr, 10)
          if (!isNaN(fileSize)) {
            totalSize += fileSize
            fileCount++
          }
        }
      }
      
      // Formatiere die Gesamtgröße
      dashboardData.value.sharedFiles.size = formatFileSize(totalSize)
      dashboardData.value.sharedFiles.count = fileCount
      
      // Berechne Progress (optional - kann für Speicherplatz-Nutzung verwendet werden)
      // Hier könnten wir z.B. einen Maximalwert setzen oder die Größe als Prozent anzeigen
      dashboardData.value.sharedFiles.progress = Math.min(100, Math.round((totalSize / (1024 * 1024 * 1024 * 1000)) * 100)) // Max 1TB = 100%
      
      console.log(`Geteilte Dateien: ${fileCount} Dateien, Gesamtgröße: ${dashboardData.value.sharedFiles.size}`)
      
    } catch (shareError) {
      console.error('Fehler beim Laden der share.xml:', shareError)
      // Behalte Standard-Werte bei Fehler
    }
    
  } catch (err) {
    console.error('Fehler beim Laden der Dashboard-Daten:', err)
    error.value = 'Fehler beim Laden der Server-Informationen'
  } finally {
    isLoading.value = false
  }
}

const formatFileSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 B'
  
  // Behandle negative Werte
  const isNegative = bytes < 0
  const absBytes = Math.abs(bytes)
  
  const i = Math.floor(Math.log(absBytes) / Math.log(1024))
  const formattedSize = Math.round(absBytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  
  return isNegative ? '-' + formattedSize : formattedSize
}

const refreshDashboard = () => {
  loadDashboardData()
}

onMounted(() => {
  // Überprüfen ob der Benutzer authentifiziert ist
  if (!authStore.isAuthenticated) {
    router.push('/login')
  } else {
    // Lade Dashboard-Daten bei der Initialisierung
    loadDashboardData()
    
    // Automatisches Aktualisieren alle 30 Sekunden
    setInterval(() => {
      loadDashboardData()
    }, 30000)
  }
})
</script>

<style scoped>
.card {
  border: none;
  transition: all 0.3s ease;
  border-radius: 12px;
}

.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
  transform: translateY(-2px);
}

.card-body {
  padding: 1.5rem;
}

.shadow-sm {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
}

.progress {
  border-radius: 5px;
}

.border-start {
  border-left-width: 4px !important;
}

.border-4 {
  border-width: 4px !important;
}

/* Bootstrap Icons Styling */
.bi {
  color: #6c757d;
}

/* Custom colors for borders */
.border-info {
  border-color: #0dcaf0 !important;
}

.border-warning {
  border-color: #ffc107 !important;
}

.border-success {
  border-color: #198754 !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .fs-1 {
    font-size: 2rem !important;
  }
  
  .card-body {
    padding: 1rem;
  }
}

.list-group-item {
  border: none;
  border-bottom: 1px solid #dee2e6;
  padding: 1rem 1.25rem;
}

.list-group-item:last-child {
  border-bottom: none;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

/* Better spacing for stats cards */
.row.g-3 > .col-xl-3,
.row.g-3 > .col-lg-6,
.row.g-3 > .col-md-6 {
  margin-bottom: 1rem;
}

/* Better card animations and spacing */
.card-title {
  font-weight: 600;
}

.card-text {
  font-weight: 700;
  font-size: 1.75rem;
}

/* Ultra-wide screen optimizations */
@media (min-width: 1400px) {
  .card-body {
    padding: 2rem !important;
  }
}
</style>