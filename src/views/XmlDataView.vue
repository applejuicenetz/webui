<template>
  <AppLayout>
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i class="fas fa-file-code me-2"></i>
              XML-Datenanalyse
            </h2>
            <button 
              @click="loadAllXmlData" 
              class="btn btn-primary"
              :disabled="isLoading"
            >
              <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': isLoading }"></i>
              {{ isLoading ? 'Wird geladen...' : 'Daten aktualisieren' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading && !xmlData" class="text-center py-5">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <h5>Lade XML-Dateien...</h5>
        <p class="text-muted">settings.xml, information.xml, modified.xml, share.xml</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger">
        <h5 class="alert-heading">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Fehler beim Laden der XML-Dateien
        </h5>
        <p>{{ error }}</p>
        <button @click="loadAllXmlData" class="btn btn-outline-danger btn-sm">
          Erneut versuchen
        </button>
      </div>

      <!-- XML Data Display -->
      <div v-else-if="xmlData" class="row g-4">
        <!-- Settings.xml -->
        <div class="col-lg-6">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-cogs me-2"></i>
                Settings.xml
              </h5>
            </div>
            <div class="card-body">
              <div v-if="parsedData?.settings">
                <h6>Konfiguration:</h6>
                <ul class="list-unstyled">
                  <li v-for="(value, key) in extractSettingsInfo(parsedData.settings)" :key="key">
                    <strong>{{ key }}:</strong> {{ value }}
                  </li>
                </ul>
              </div>
              <details class="mt-3">
                <summary class="btn btn-outline-secondary btn-sm">Raw XML anzeigen</summary>
                <pre class="mt-2 p-2 bg-light border rounded small">{{ xmlData.settings }}</pre>
              </details>
            </div>
          </div>
        </div>

        <!-- Information.xml -->
        <div class="col-lg-6">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-info-circle me-2"></i>
                Information.xml
              </h5>
            </div>
            <div class="card-body">
              <div v-if="parsedData?.information">
                <h6>Server-Informationen:</h6>
                <ul class="list-unstyled">
                  <li v-for="(value, key) in extractInformationInfo(parsedData.information)" :key="key">
                    <strong>{{ key }}:</strong> {{ value }}
                  </li>
                </ul>
              </div>
              <details class="mt-3">
                <summary class="btn btn-outline-secondary btn-sm">Raw XML anzeigen</summary>
                <pre class="mt-2 p-2 bg-light border rounded small">{{ xmlData.information }}</pre>
              </details>
            </div>
          </div>
        </div>

        <!-- Modified.xml -->
        <div class="col-lg-6">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-edit me-2"></i>
                Modified.xml
              </h5>
            </div>
            <div class="card-body">
              <div v-if="parsedData?.modified">
                <h6>Änderungen:</h6>
                <div v-if="extractModifiedInfo(parsedData.modified).length > 0">
                  <ul class="list-unstyled">
                    <li v-for="(item, index) in extractModifiedInfo(parsedData.modified)" :key="index" class="mb-2">
                      <div class="border-start border-primary border-3 ps-3">
                        <strong>{{ item.name }}</strong><br>
                        <small class="text-muted">{{ item.details }}</small>
                      </div>
                    </li>
                  </ul>
                </div>
                <div v-else class="text-muted">
                  <i class="fas fa-check-circle me-2"></i>
                  Keine Änderungen vorhanden
                </div>
              </div>
              <details class="mt-3">
                <summary class="btn btn-outline-secondary btn-sm">Raw XML anzeigen</summary>
                <pre class="mt-2 p-2 bg-light border rounded small">{{ xmlData.modified }}</pre>
              </details>
            </div>
          </div>
        </div>

        <!-- Share.xml -->
        <div class="col-lg-6">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-share-alt me-2"></i>
                Share.xml
              </h5>
            </div>
            <div class="card-body">
              <div v-if="parsedData?.share">
                <h6>Geteilte Dateien:</h6>
                <div v-if="extractShareInfo(parsedData.share).length > 0">
                  <ul class="list-unstyled">
                    <li v-for="(item, index) in extractShareInfo(parsedData.share)" :key="index" class="mb-2">
                      <div class="border-start border-success border-3 ps-3">
                        <strong>{{ item.name }}</strong><br>
                        <small class="text-muted">{{ item.details }}</small>
                      </div>
                    </li>
                  </ul>
                </div>
                <div v-else class="text-muted">
                  <i class="fas fa-folder-open me-2"></i>
                  Keine geteilten Dateien vorhanden
                </div>
              </div>
              <details class="mt-3">
                <summary class="btn btn-outline-secondary btn-sm">Raw XML anzeigen</summary>
                <pre class="mt-2 p-2 bg-light border rounded small">{{ xmlData.share }}</pre>
              </details>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Statistics -->
      <div v-if="xmlData && parsedData" class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-chart-bar me-2"></i>
                Schnelle Übersicht
              </h5>
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-3">
                  <div class="border-end">
                    <h4 class="text-primary">{{ Object.keys(extractSettingsInfo(parsedData.settings)).length }}</h4>
                    <small class="text-muted">Einstellungen</small>
                  </div>
                </div>
                <div class="col-3">
                  <div class="border-end">
                    <h4 class="text-info">{{ Object.keys(extractInformationInfo(parsedData.information)).length }}</h4>
                    <small class="text-muted">Informationen</small>
                  </div>
                </div>
                <div class="col-3">
                  <div class="border-end">
                    <h4 class="text-warning">{{ extractModifiedInfo(parsedData.modified).length }}</h4>
                    <small class="text-muted">Änderungen</small>
                  </div>
                </div>
                <div class="col-3">
                  <h4 class="text-success">{{ extractShareInfo(parsedData.share).length }}</h4>
                  <small class="text-muted">Geteilte Dateien</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- XML Data Testing & Demo Section -->
      <div class="row mt-4">
        <div class="col-lg-4">
          <ServerDebugTest />
        </div>
        <div class="col-lg-4">
          <XmlDebugSimple />
        </div>
        <div class="col-lg-4">
          <XmlDataDemo />
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
  loadAllXmlData as apiLoadAllXmlData, 
  loadAndParseAllXml,
  getXmlValue,
  getXmlElements
} from '@/utils/api'
import AppLayout from '@/components/AppLayout.vue'
import XmlDataDemo from '@/components/XmlDataDemo.vue'
import XmlDebugSimple from '@/components/XmlDebugSimple.vue'
import ServerDebugTest from '@/components/ServerDebugTest.vue'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const error = ref<string | null>(null)
const xmlData = ref<{
  settings: string,
  information: string,
  modified: string,
  share: string
} | null>(null)

const parsedData = ref<{
  settings: Document,
  information: Document,
  modified: Document,
  share: Document
} | null>(null)

const loadAllXmlData = async () => {
  isLoading.value = true
  error.value = null

  try {
    // Lade alle XML-Dateien
    xmlData.value = await apiLoadAllXmlData()
    
    // Parse alle XML-Dateien
    parsedData.value = await loadAndParseAllXml()
    
    console.log('XML-Daten erfolgreich geladen:', xmlData.value)
    console.log('Geparste XML-Daten:', parsedData.value)
    
  } catch (err) {
    console.error('Fehler beim Laden der XML-Dateien:', err)
    error.value = err instanceof Error ? err.message : 'Unbekannter Fehler'
  } finally {
    isLoading.value = false
  }
}

// Helper functions to extract information from XML
const extractSettingsInfo = (xmlDoc: Document): Record<string, string> => {
  const info: Record<string, string> = {}
  
  // Extrahiere verschiedene Einstellungen
  const commonSettings = [
    'nickname', 'port', 'downloaddir', 'tempdir', 
    'maxdownloads', 'maxuploads', 'maxconnections'
  ]
  
  commonSettings.forEach(setting => {
    const value = getXmlValue(xmlDoc, setting)
    if (value) {
      info[setting] = value
    }
  })
  
  return info
}

const extractInformationInfo = (xmlDoc: Document): Record<string, string> => {
  const info: Record<string, string> = {}
  
  // Extrahiere Server-Informationen
  const commonInfo = [
    'version', 'uptime', 'downloads', 'uploads', 
    'downloadspeed', 'uploadspeed', 'users', 'files'
  ]
  
  commonInfo.forEach(infoKey => {
    const value = getXmlValue(xmlDoc, infoKey)
    if (value) {
      info[infoKey] = value
    }
  })
  
  return info
}

const extractModifiedInfo = (xmlDoc: Document): Array<{ name: string, details: string }> => {
  const modifications: Array<{ name: string, details: string }> = []
  
  // Extrahiere Änderungen (dies hängt von der XML-Struktur ab)
  const modifiedElements = getXmlElements(xmlDoc, 'modified') // oder entsprechender Tag
  
  modifiedElements.forEach(element => {
    const name = element.getAttribute('name') || element.textContent || 'Unbekannt'
    const timestamp = element.getAttribute('timestamp') || ''
    const type = element.getAttribute('type') || ''
    
    modifications.push({
      name: name,
      details: `${type} ${timestamp}`.trim()
    })
  })
  
  return modifications
}

const extractShareInfo = (xmlDoc: Document): Array<{ name: string, details: string }> => {
  const shares: Array<{ name: string, details: string }> = []
  
  // Extrahiere geteilte Dateien
  const shareElements = getXmlElements(xmlDoc, 'file') // oder entsprechender Tag
  
  shareElements.forEach(element => {
    const name = element.getAttribute('name') || getXmlValue(element.ownerDocument, 'filename') || 'Unbekannt'
    const size = element.getAttribute('size') || getXmlValue(element.ownerDocument, 'size') || ''
    const type = element.getAttribute('type') || ''
    
    shares.push({
      name: name,
      details: `${type} ${size}`.trim()
    })
  })
  
  return shares
}

onMounted(() => {
  // Überprüfen ob der Benutzer authentifiziert ist
  if (!authStore.isAuthenticated) {
    router.push('/login')
  } else {
    // Lade XML-Daten bei der Initialisierung
    loadAllXmlData()
  }
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

pre {
  max-height: 200px;
  overflow-y: auto;
  font-size: 0.75rem;
  white-space: pre-wrap;
  word-break: break-all;
}

details summary {
  cursor: pointer;
  user-select: none;
}

details summary::-webkit-details-marker {
  display: none;
}

details summary::before {
  content: '▶';
  margin-right: 0.5rem;
  transition: transform 0.2s;
}

details[open] summary::before {
  transform: rotate(90deg);
}
</style>