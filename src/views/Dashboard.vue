<script setup>
import { ref, onMounted, onUnmounted, computed, reactive } from 'vue'
import { CCard, CCardBody, CCardHeader } from '@coreui/vue'
import { CRow, CCol } from '@coreui/vue'
import { CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell } from '@coreui/vue'
import { CIcon } from '@coreui/icons-vue'
import { CSpinner, CBadge, CButton } from '@coreui/vue'
import { CWidgetStatsC } from '@coreui/vue'
import {
  cilStorage,
  cilCloudDownload,
  cilCloudUpload,
  cilFolderOpen,
  cilDiamond,
  cilNewspaper,
  cilGlobeAlt,
  cilFork,
  cilReload,
  cilWifiSignal4,
  cilWifiSignalOff,
  cilBank
} from '@coreui/icons'
import { useRouter } from 'vue-router'
import { useCoreStore } from '../stores/core.js'
import { useAuthStore } from '../stores/auth.js'
import DebugPanel from '../components/DebugPanel.vue'

const router = useRouter()
const coreStore = useCoreStore()
const authStore = useAuthStore()

// Reactive data
const lastUpdateTime = ref(new Date())
const error = ref(null)
const showDebug = ref(false)

// Testwerte für Downloads und Uploads
const downloadStats = reactive({
  active: 2,
  total: 5
})

const uploadStats = reactive({
  active: 1
})

// Computed properties
const coreData = computed(() => {
  console.log('[DASHBOARD] Core data:', coreStore.coreData)
  console.log('[DASHBOARD] Downloads:', coreStore.coreData.statistics.downloads)
  return coreStore.coreData
})
const isLoading = computed(() => coreStore.isLoading)
const isConnected = computed(() => coreStore.isConnected)
const isOnline = computed(() => coreStore.isOnline)
const lastUpdate = computed(() => coreStore.lastUpdateFormatted)
const connectionStatus = computed(() => coreStore.connectionStatus)
const networkActivity = computed(() => coreStore.networkActivity)

// Connection status badge variant
const connectionBadgeVariant = computed(() => {
  if (isLoading.value) return 'warning'
  if (isConnected.value) return 'success'
  return 'danger'
})

// Navigation functions
const navigateTo = (page) => {
  router.push(`/app/${page}`)
}

// Manual refresh function
const refreshData = async () => {
  try {
    error.value = null
    await coreStore.refresh()
    
    // Testwerte aktualisieren
    downloadStats.active = Math.floor(Math.random() * (downloadStats.total + 1))
    uploadStats.active = Math.floor(Math.random() * 3)
    
    lastUpdateTime.value = new Date()
    console.log('[DASHBOARD] Refreshed with test values:', downloadStats, uploadStats)
  } catch (err) {
    error.value = err.message
    console.error('Dashboard refresh error:', err)
  }
}

// Initialize data loading
const initializeData = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  try {
    error.value = null
    console.log('[DASHBOARD] Loading core data...')
    await coreStore.loadCoreData()
    console.log('[DASHBOARD] Core data loaded:', coreStore.coreData)
    
    // Testwerte initialisieren
    downloadStats.active = 2
    downloadStats.total = 5
    uploadStats.active = 1
    console.log('[DASHBOARD] Test values initialized:', downloadStats, uploadStats)

    // Start auto-update with 5 second interval (schnellere Updates für bessere Reaktionszeit)
    coreStore.startAutoUpdate(5000)

    lastUpdateTime.value = new Date()
  } catch (err) {
    error.value = err.message
    console.error('Dashboard initialization error:', err)

    // If authentication error, redirect to login
    if (err.message.includes('Wrong password') ||
        err.message.includes('Not authenticated')) {
      router.push('/login')
    }
  }
}

// Lifecycle
onMounted(() => {
  console.log('Dashboard mounted')
  initializeData()
})

onUnmounted(() => {
  // Stop auto-update when component is unmounted
  coreStore.stopAutoUpdate()
})
</script>

<template>
  <div class="dashboard-container">
    <CRow>
      <!-- Linke Spalte -->
      <CCol xs="12" sm="12" md="6" lg="6">
        <div class="tab-content rounded-bottom mb-3">
          <div class="tab-pane active preview">
            <div class="row g-4" id="output">
              <!-- Aktueller Server -->
              <div class="col-12 col-lg-12 col-xl-8 col-xxl-8">
                <CCard class="mb-3">
                  <CCardHeader class="d-flex justify-content-between align-items-center">
                    <div>
                      <CIcon :icon="cilStorage" class="me-2" />
                      aktueller Server
                    </div>
                    <div class="d-flex align-items-center">
                      <CButton
                        :disabled="isLoading"
                        @click="refreshData"
                        variant="outline"
                        color="primary"
                        size="sm"
                        class="me-1"
                      >
                        <CSpinner v-if="isLoading" size="sm" class="me-1" />
                        <CIcon v-else :icon="cilReload" class="me-1" />

                      </CButton>
                    </div>
                  </CCardHeader>
                  <CCardBody>
                    <div v-if="error" class="alert alert-danger">
                      <strong>Fehler:</strong> {{ error }}
                    </div>
                    <div v-else>
                      <div class="text-body-secondary text-end">
                        <CIcon :icon="cilStorage" class="icon-xxl" />
                      </div>
                      <div class="fs-4 fw-semibold">{{ coreData.server.name }}</div>
                      <div class="small">{{ coreData.networkInfo.welcomeMessage }}</div>
                      <div class="small text-body-secondary text-uppercase fw-semibold text-truncate text-end">
                        verbunden seit {{ coreData.coreInfo.uptime }}
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </div>

              <!-- Downloads -->
              <div class="col-6 col-lg-5 col-xl-4 col-xxl-4">
                <CCard class="cursor-pointer" @click="navigateTo('downloads')">
                  <CCardBody>
                    <div class="text-body-secondary text-end">
                      <CIcon :icon="cilCloudDownload" class="icon-xxl" />
                    </div>
                    <div class="fs-4 fw-semibold">
                      {{ downloadStats.active }}/{{ downloadStats.total }}
                    </div>
                    <div class="small text-body-secondary text-uppercase fw-semibold text-truncate">aktive Downloads</div>
                    <div class="progress progress-thin mt-3 mb-0">
                      <div class="progress-bar bg-info" role="progressbar"
                           :style="{ width: (downloadStats.total > 0 ? (downloadStats.active / downloadStats.total * 100) : 0) + '%' }"
                           :aria-valuenow="downloadStats.active"
                           aria-valuemin="0"
                           :aria-valuemax="downloadStats.total"></div>
                    </div>
                    <div v-if="isLoading" class="small text-muted mt-1">
                      <CSpinner size="sm" class="me-1" />
                      Lade...
                    </div>
                  </CCardBody>
                </CCard>
              </div>

              <!-- Uploads -->
              <div class="col-6 col-lg-5 col-xl-4 col-xxl-4">
                <CCard class="cursor-pointer" @click="navigateTo('uploads')">
                  <CCardBody>
                    <div class="text-body-secondary text-end">
                      <CIcon :icon="cilCloudUpload" class="icon-xxl" />
                    </div>
                    <div class="fs-4 fw-semibold">{{ uploadStats.active }}</div>
                    <div class="small text-body-secondary text-uppercase fw-semibold text-truncate">aktive Uploads</div>
                    <div class="progress progress-thin mt-3 mb-0">
                      <div class="progress-bar bg-success" role="progressbar"
                           :style="{ width: uploadStats.active > 0 ? '50%' : '0%' }"
                           :aria-valuenow="uploadStats.active"
                           aria-valuemin="0"
                           aria-valuemax="10"></div>
                    </div>
                    <div v-if="isLoading" class="small text-muted mt-1">
                      <CSpinner size="sm" class="me-1" />
                      Lade...
                    </div>
                  </CCardBody>
                </CCard>
              </div>

              <!-- Shared Files -->
              <div class="col-6 col-lg-5 col-xl-4 col-xxl-4">
                <CCard class="cursor-pointer" @click="navigateTo('shares')">
                  <CCardBody>
                    <div class="text-body-secondary text-end">
                      <CIcon :icon="cilFolderOpen" class="icon-xxl" />
                    </div>
                    <div class="fs-4 fw-semibold">{{ coreData.statistics.shares.size }}</div>
                    <div class="small text-body-secondary text-uppercase fw-semibold text-truncate">{{ coreData.statistics.shares.count }} Dateien</div>
                    <div class="progress progress-thin mt-3 mb-0">
                      <div class="progress-bar bg-warning" role="progressbar"
                           :style="{ width: coreData.statistics.shares.count > 0 ? '75%' : '0%' }"
                           :aria-valuenow="coreData.statistics.shares.count"
                           aria-valuemin="0"
                           aria-valuemax="100"></div>
                    </div>
                  </CCardBody>
                </CCard>
              </div>

              <!-- Credits -->
              <div class="col-6 col-lg-5 col-xl-4 col-xxl-4">
                <CCard class="cursor-pointer" @click="navigateTo('extras')">
                  <CCardBody>
                    <div class="text-body-secondary text-end">
                      <CIcon :icon="cilBank" class="icon-xxl" />
                    </div>
                    <div class="fs-4 fw-semibold">
                      <span :class="coreData.statistics.credits.includes('-') ? 'text-danger' : 'text-success'">
                        {{ coreData.statistics.credits }}
                      </span>
                    </div>
                    <div class="small text-body-secondary text-uppercase fw-semibold text-truncate">Punkte</div>
                    <div class="progress progress-thin mt-3 mb-0">
                      <div v-if="!coreData.statistics.credits.includes('-')"
                           class="progress-bar bg-success"
                           role="progressbar"
                           style="width: 50%"
                           aria-valuenow="50"
                           aria-valuemin="0"
                           aria-valuemax="100"></div>
                      <div v-else
                           class="progress-bar bg-danger"
                           role="progressbar"
                           style="width: 50%"
                           aria-valuenow="50"
                           aria-valuemin="0"
                           aria-valuemax="100"></div>
                    </div>
                  </CCardBody>
                </CCard>
              </div>
            </div>
          </div>
        </div>

        <!-- Traffic -->
        <div class="row">
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <CCard class="mb-3">
              <CCardBody class="p-3">
                <div class="card-title fs-4 fw-semibold mb-4">Traffic</div>
                <div class="row">
                  <div class="col-12 col-lg-4 col-xl-4 col-xxl-4">
                    <div class="border-start border-start-4 border-start-info px-3 mb-3">
                      <div class="small text-body-secondary text-truncate">Heute</div>
                      <div class="fs-5 fw-semibold">{{ coreData.statistics?.traffic?.today || '0' }}</div>
                    </div>
                  </div>
                  <div class="col-12 col-lg-4 col-xl-4 col-xxl-4">
                    <div class="border-start border-start-4 border-start-info px-3 mb-3">
                      <div class="small text-body-secondary text-truncate">Gestern</div>
                      <div class="fs-5 fw-semibold">{{ coreData.statistics?.traffic?.yesterday || '0' }}</div>
                    </div>
                  </div>
                  <div class="col-12 col-lg-4 col-xl-4 col-xxl-4">
                    <div class="border-start border-start-4 border-start-info px-3 mb-3">
                      <div class="small text-body-secondary text-truncate">Monat</div>
                      <div class="fs-5 fw-semibold">{{ coreData.statistics?.traffic?.month || '0' }}</div>
                    </div>
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </div>
        </div>
      </CCol>

      <!-- Rechte Spalte -->
      <CCol xs="12" sm="12" md="6" lg="6">
        <!-- Core Informationen -->
        <CCard class="mb-3">
          <CCardBody class="p-3">
            <div class="card-title fs-4 fw-semibold mb-4">Core Informationen</div>
            <div class="row">
              <div class="col-12 col-lg-4 col-xl-4 col-xxl-4">
                <div class="border-start border-start-4 border-start-info px-3 mb-3">
                  <div class="small text-body-secondary text-truncate">Server Zeit</div>
                  <div class="fs-5 fw-semibold">{{ coreData.coreInfo.serverTime }}</div>
                </div>
              </div>
              <div class="col-12 col-lg-4 col-xl-4 col-xxl-4">
                <div class="border-start border-start-4 border-start-info px-3 mb-3">
                  <div class="small text-body-secondary text-truncate">Core-Version</div>
                  <div class="fs-5 fw-semibold">{{ coreData.coreInfo.version }}</div>
                </div>
              </div>
              <div class="col-12 col-lg-4 col-xl-4 col-xxl-4">
                <div class="border-start border-start-4 border-start-info px-3 mb-3">
                  <div class="small text-body-secondary text-truncate">Betriebssystem</div>
                  <div class="fs-5 fw-semibold">
                    <CIcon :icon="coreData.coreInfo.os.toLowerCase().includes('linux') ? cilGlobeAlt : cilGlobeAlt" class="me-1" />
                    {{ coreData.coreInfo.os }}
                  </div>
                </div>
              </div>
            </div>

            <div class="card-title fs-4 fw-semibold mb-4">Netzwerk Informationen</div>
            <div class="row">
              <div class="col-12 col-lg-4 col-xl-4 col-xxl-4">
                <div class="border-start border-start-4 border-start-warning px-3 mb-3">
                  <div class="small text-body-secondary text-truncate">Verbindungen</div>
                  <div class="fs-5 fw-semibold">{{ coreData.coreInfo.connections }}</div>
                </div>
              </div>
              <div class="col-12 col-lg-4 col-xl-4 col-xxl-4">
                <div class="border-start border-start-4 border-start-warning px-3 mb-3">
                  <div class="small text-body-secondary text-truncate">Download</div>
                  <div class="fs-5 fw-semibold">{{ coreData.coreInfo.downloadSpeed }}</div>
                </div>
              </div>
              <div class="col-12 col-lg-4 col-xl-4 col-xxl-4">
                <div class="border-start border-start-4 border-start-warning px-3 mb-3">
                  <div class="small text-body-secondary text-truncate">Upload</div>
                  <div class="fs-5 fw-semibold">{{ coreData.coreInfo.uploadSpeed }}</div>
                </div>
              </div>
              <div class="col-12 col-lg-4 col-xl-4 col-xxl-4">
                <div class="border-start border-start-4 border-start-warning px-3 mb-3">
                  <div class="small text-body-secondary text-truncate">Bytes in</div>
                  <div class="fs-5 fw-semibold">{{ coreData.coreInfo.bytesIn }}</div>
                </div>
              </div>
              <div class="col-12 col-lg-4 col-xl-4 col-xxl-4">
                <div class="border-start border-start-4 border-start-warning px-3 mb-3">
                  <div class="small text-body-secondary text-truncate">Bytes out</div>
                  <div class="fs-5 fw-semibold">{{ coreData.coreInfo.bytesOut }}</div>
                </div>
              </div>
            </div>

            <div class="card-title fs-4 fw-semibold mb-4">Community</div>
            <div class="row">
              <div class="col-12 col-lg-4 col-xl-4 col-xxl-4">
                <div class="border-start border-start-4 border-start-success px-3 mb-3">
                  <div class="small text-body-secondary text-truncate">Shared User</div>
                  <div class="fs-5 fw-semibold">{{ coreData.networkInfo.sharedUsers }}</div>
                </div>
              </div>
              <div class="col-12 col-lg-8 col-xl-8 col-xxl-8">
                <div class="border-start border-start-4 border-start-success px-3 mb-3">
                  <div class="small text-body-secondary text-truncate">gesamte Dateien</div>
                  <div class="fs-5 fw-semibold">{{ coreData.networkInfo.totalFiles }} ({{ coreData.networkInfo.totalSize }})</div>
                </div>
              </div>
            </div>
          </CCardBody>
        </CCard>

        <!-- Server Willkommensnachricht -->
        <CCard v-if="coreData.networkInfo.welcomeMessage" class="mb-4">
          <CCardHeader>
            <CIcon :icon="cilNewspaper" class="me-2" />
            Server Nachricht
          </CCardHeader>
          <CCardBody>
            <div class="alert alert-info mb-0">
              {{ coreData.networkInfo.welcomeMessage }}
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Debug Panel -->
    <DebugPanel v-if="showDebug" :data="coreData" />
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.icon-xxl {
  font-size: 2.5rem;
}

.bg-warning {
  background-color: #f9b115 !important;
}

.bg-primary {
  background-color: #321fdb !important;
}

/* Tabellen-Styling */
.table {
  margin-bottom: 0;
}

.table td {
  border-top: none;
  padding: 0.75rem;
  vertical-align: middle;
}

.table td:first-child {
  font-weight: 500;
}

/* Links im News-Bereich */
.card-body a {
  color: #321fdb;
  text-decoration: none;
}

.card-body a:hover {
  text-decoration: underline;
}

/* Progress Bar Styling */
.progress-thin {
  height: 4px;
}

/* Border Styling */
.border-start-4 {
  border-left-width: 4px !important;
}

.border-start-info {
  border-left-color: #39f !important;
}

.border-start-warning {
  border-left-color: #f9b115 !important;
}

.border-start-success {
  border-left-color: #2eb85c !important;
}

/* Card Styling */
.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* Responsive Anpassungen */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
  }

  .icon-xxl {
    font-size: 2rem;
  }

  .fs-4 {
    font-size: 1.2rem !important;
  }

  .fs-5 {
    font-size: 1.1rem !important;
  }
}
</style>
