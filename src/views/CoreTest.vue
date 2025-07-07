<!--
  Test-Seite für Core-Datenverarbeitung
  Zum Testen der XML-zu-JSON-Konvertierung und der Echtzeit-Updates
-->

<template>
  <div class="core-test-container">
    <CRow>
      <CCol xs="12">
        <CCard class="mb-4">
          <CCardHeader>
            <h4>AppleJuice Core Test</h4>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol xs="12" md="6">
                <CButton
                  @click="testConnection"
                  :disabled="isLoading"
                  color="primary"
                  class="me-2"
                >
                  <CSpinner v-if="isLoading" size="sm" class="me-1" />
                  Test Verbindung
                </CButton>
                <CButton
                  @click="loadAllData"
                  :disabled="isLoading"
                  color="success"
                  class="me-2"
                >
                  Alle Daten laden
                </CButton>
                <CButton
                  @click="clearResults"
                  color="secondary"
                >
                  Ergebnisse löschen
                </CButton>
              </CCol>
              <CCol xs="12" md="6">
                <div class="text-end">
                  <CBadge :color="connectionStatus.color" class="me-2">
                    {{ connectionStatus.text }}
                  </CBadge>
                  <small class="text-muted">
                    Letzte Aktualisierung: {{ lastUpdate }}
                  </small>
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Fehler-Anzeige -->
    <CRow v-if="error">
      <CCol xs="12">
        <CCard color="danger" class="mb-4">
          <CCardHeader>
            <h5>Fehler</h5>
          </CCardHeader>
          <CCardBody>
            <pre>{{ error }}</pre>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Ergebnisse -->
    <CRow v-if="results.length > 0">
      <CCol xs="12">
        <CCard>
          <CCardHeader>
            <h5>Test-Ergebnisse</h5>
          </CCardHeader>
          <CCardBody>
            <CAccordion>
              <CAccordionItem
                v-for="(result, index) in results"
                :key="index"
                :item-key="index"
              >
                <CAccordionHeader>
                  <span class="me-2">{{ result.endpoint }}</span>
                  <CBadge :color="result.success ? 'success' : 'danger'">
                    {{ result.success ? 'OK' : 'ERROR' }}
                  </CBadge>
                  <small class="text-muted ms-2">
                    {{ result.timestamp }}
                  </small>
                </CAccordionHeader>
                <CAccordionBody>
                  <CTabs>
                    <CTabList>
                      <CTab>Raw XML</CTab>
                      <CTab>JSON</CTab>
                      <CTab>Extracted Data</CTab>
                    </CTabList>
                    <CTabContent>
                      <CTabPane>
                        <pre class="code-block">{{ result.rawXml || 'Keine XML-Daten' }}</pre>
                      </CTabPane>
                      <CTabPane>
                        <pre class="code-block">{{ JSON.stringify(result.jsonData, null, 2) }}</pre>
                      </CTabPane>
                      <CTabPane>
                        <pre class="code-block">{{ JSON.stringify(result.extractedData, null, 2) }}</pre>
                      </CTabPane>
                    </CTabContent>
                  </CTabs>
                </CAccordionBody>
              </CAccordionItem>
            </CAccordion>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Live-Daten Anzeige -->
    <CRow v-if="liveData">
      <CCol xs="12">
        <CCard>
          <CCardHeader>
            <h5>Live-Daten (alle 5 Sekunden)</h5>
            <div class="float-end">
              <CButton
                @click="toggleLiveUpdate"
                :color="liveUpdateActive ? 'danger' : 'success'"
                size="sm"
              >
                {{ liveUpdateActive ? 'Stop' : 'Start' }}
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol xs="12" md="6">
                <h6>Server-Informationen</h6>
                <ul class="list-unstyled">
                  <li><strong>Name:</strong> {{ liveData.server.name }}</li>
                  <li><strong>IP:</strong> {{ liveData.server.ip }}</li>
                  <li><strong>Beschreibung:</strong> {{ liveData.server.description }}</li>
                </ul>
              </CCol>
              <CCol xs="12" md="6">
                <h6>Statistiken</h6>
                <ul class="list-unstyled">
                  <li><strong>Downloads:</strong> {{ liveData.statistics.downloads.active }}/{{ liveData.statistics.downloads.total }}</li>
                  <li><strong>Uploads:</strong> {{ liveData.statistics.uploads.active }}</li>
                  <li><strong>Shares:</strong> {{ liveData.statistics.shares.count }} ({{ liveData.statistics.shares.size }})</li>
                  <li><strong>Credits:</strong> {{ liveData.statistics.credits }}</li>
                </ul>
              </CCol>
            </CRow>
            <CRow>
              <CCol xs="12" md="6">
                <h6>Core-Informationen</h6>
                <ul class="list-unstyled">
                  <li><strong>Version:</strong> {{ liveData.coreInfo.version }}</li>
                  <li><strong>OS:</strong> {{ liveData.coreInfo.os }}</li>
                  <li><strong>Uptime:</strong> {{ liveData.coreInfo.uptime }}</li>
                  <li><strong>Verbindungen:</strong> {{ liveData.coreInfo.connections }}</li>
                </ul>
              </CCol>
              <CCol xs="12" md="6">
                <h6>Netzwerk</h6>
                <ul class="list-unstyled">
                  <li><strong>Download:</strong> {{ liveData.networkInfo.download }}</li>
                  <li><strong>Upload:</strong> {{ liveData.networkInfo.upload }}</li>
                  <li><strong>Shared Users:</strong> {{ liveData.networkInfo.sharedUsers }}</li>
                  <li><strong>Dateien:</strong> {{ liveData.networkInfo.totalFiles }}</li>
                </ul>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  CCard, CCardBody, CCardHeader, CButton, CSpinner, CBadge,
  CRow, CCol, CAccordion, CAccordionItem, CAccordionHeader, CAccordionBody,
  CTabs, CTabList, CTab, CTabContent, CTabPane
} from '@coreui/vue'
import coreService from '../services/coreService.js'
import { useCoreStore } from '../stores/core.js'
import { useAuthStore } from '../stores/auth.js'

const coreStore = useCoreStore()
const authStore = useAuthStore()

// Reactive data
const isLoading = ref(false)
const error = ref(null)
const results = ref([])
const liveData = ref(null)
const liveUpdateActive = ref(false)
const liveUpdateInterval = ref(null)
const lastUpdate = ref('Nie')

// Computed properties
const connectionStatus = computed(() => {
  if (isLoading.value) return { color: 'warning', text: 'Teste...' }
  if (error.value) return { color: 'danger', text: 'Fehler' }
  if (results.value.length > 0) return { color: 'success', text: 'Verbunden' }
  return { color: 'secondary', text: 'Nicht getestet' }
})

// Test endpoints
const testEndpoints = [
  { type: 'xml', endpoint: 'information.xml', description: 'Core-Informationen' },
  { type: 'xml', endpoint: 'downloads.xml', description: 'Download-Liste' },
  { type: 'xml', endpoint: 'uploads.xml', description: 'Upload-Liste' },
  { type: 'xml', endpoint: 'shared.xml', description: 'Geteilte Dateien' },
  { type: 'xml', endpoint: 'server.xml', description: 'Server-Informationen' },
  { type: 'xml', endpoint: 'network.xml', description: 'Netzwerk-Informationen' }
]

// Test connection
const testConnection = async () => {
  if (!authStore.isAuthenticated) {
    error.value = 'Nicht authentifiziert'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const result = await coreService.command('xml', 'information.xml')

    results.value.push({
      endpoint: 'information.xml',
      success: true,
      timestamp: new Date().toLocaleString('de-DE'),
      rawXml: null, // XML nicht verfügbar in diesem Test
      jsonData: result,
      extractedData: coreService.extractCoreInfo(result)
    })

    lastUpdate.value = new Date().toLocaleString('de-DE')
  } catch (err) {
    error.value = err.message
    results.value.push({
      endpoint: 'information.xml',
      success: false,
      timestamp: new Date().toLocaleString('de-DE'),
      rawXml: null,
      jsonData: null,
      extractedData: null,
      error: err.message
    })
  } finally {
    isLoading.value = false
  }
}

// Load all data
const loadAllData = async () => {
  if (!authStore.isAuthenticated) {
    error.value = 'Nicht authentifiziert'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const promises = testEndpoints.map(async (endpoint) => {
      try {
        const result = await coreService.command(endpoint.type, endpoint.endpoint)
        return {
          endpoint: endpoint.endpoint,
          description: endpoint.description,
          success: true,
          timestamp: new Date().toLocaleString('de-DE'),
          rawXml: null,
          jsonData: result,
          extractedData: extractDataForEndpoint(endpoint.endpoint, result)
        }
      } catch (err) {
        return {
          endpoint: endpoint.endpoint,
          description: endpoint.description,
          success: false,
          timestamp: new Date().toLocaleString('de-DE'),
          rawXml: null,
          jsonData: null,
          extractedData: null,
          error: err.message
        }
      }
    })

    const testResults = await Promise.all(promises)
    results.value = testResults
    lastUpdate.value = new Date().toLocaleString('de-DE')
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

// Extract data for specific endpoint
const extractDataForEndpoint = (endpoint, data) => {
  switch (endpoint) {
    case 'information.xml':
      return coreService.extractCoreInfo(data)
    case 'downloads.xml':
      return coreService.extractStatistics(data, null, null)
    case 'uploads.xml':
      return coreService.extractStatistics(null, data, null)
    case 'shared.xml':
      return coreService.extractStatistics(null, null, data)
    case 'server.xml':
      return coreService.extractServerInfo(null, data)
    case 'network.xml':
      return coreService.extractNetworkInfo(data, null)
    default:
      return data
  }
}

// Live update functions
const toggleLiveUpdate = () => {
  if (liveUpdateActive.value) {
    stopLiveUpdate()
  } else {
    startLiveUpdate()
  }
}

const startLiveUpdate = () => {
  if (liveUpdateInterval.value) {
    clearInterval(liveUpdateInterval.value)
  }

  liveUpdateActive.value = true

  // Immediately load data
  loadLiveData()

  // Set up interval
  liveUpdateInterval.value = setInterval(loadLiveData, 5000)
}

const stopLiveUpdate = () => {
  if (liveUpdateInterval.value) {
    clearInterval(liveUpdateInterval.value)
    liveUpdateInterval.value = null
  }
  liveUpdateActive.value = false
}

const loadLiveData = async () => {
  try {
    const data = await coreService.getAllCoreData()
    liveData.value = data
    lastUpdate.value = new Date().toLocaleString('de-DE')
  } catch (err) {
    console.error('Live data error:', err)
    error.value = err.message
  }
}

// Clear results
const clearResults = () => {
  results.value = []
  error.value = null
  liveData.value = null
  stopLiveUpdate()
}

// Lifecycle
onMounted(() => {
  console.log('CoreTest mounted')
})

onUnmounted(() => {
  stopLiveUpdate()
})
</script>

<style scoped>
.core-test-container {
  padding: 20px;
}

.code-block {
  max-height: 400px;
  overflow-y: auto;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  font-size: 0.85em;
}

.float-end {
  float: right;
}
</style>
