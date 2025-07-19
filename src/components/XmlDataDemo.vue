<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title mb-0">
        <i class="fas fa-file-code me-2"></i>
        XML-Daten Demo & Test
      </h5>
    </div>
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-6">
          <button @click="testAllXmlEndpoints" class="btn btn-primary w-100" :disabled="isLoading">
            <i class="fas fa-play me-1" :class="{ 'fa-spin': isLoading }"></i>
            Alle XML-Endpunkte testen
          </button>
        </div>
        <div class="col-md-6">
          <button @click="clearResults" class="btn btn-outline-secondary w-100">
            <i class="fas fa-trash me-1"></i>
            Ergebnisse löschen
          </button>
        </div>
      </div>

      <!-- Test Results -->
      <div v-if="testResults.length > 0" class="mt-4">
        <h6>Test-Ergebnisse:</h6>
        <div class="table-responsive">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>XML-Datei</th>
                <th>Status</th>
                <th>Größe</th>
                <th>Aktion</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="result in testResults" :key="result.file">
                <td>{{ result.file }}</td>
                <td>
                  <span v-if="result.success" class="badge bg-success">
                    <i class="fas fa-check me-1"></i>Erfolg
                  </span>
                  <span v-else class="badge bg-danger">
                    <i class="fas fa-times me-1"></i>Fehler
                  </span>
                </td>
                <td>{{ result.size || 'N/A' }}</td>
                <td>
                  <button 
                    v-if="result.success" 
                    @click="showXmlContent(result)"
                    class="btn btn-outline-primary btn-sm"
                  >
                    Anzeigen
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- XML Content Modal Trigger -->
      <div v-if="selectedXml" class="mt-3">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">{{ selectedXml.file }}</h6>
            <button @click="selectedXml = null" class="btn btn-outline-secondary btn-sm">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="card-body">
            <pre class="small bg-light p-3 rounded" style="max-height: 300px; overflow-y: auto;">{{ selectedXml.content }}</pre>
            
            <!-- Parsed Information -->
            <div v-if="selectedXml.parsed" class="mt-3">
              <h6>Geparste Informationen:</h6>
              <ul class="list-unstyled">
                <li v-for="(value, key) in selectedXml.parsed" :key="key">
                  <strong>{{ key }}:</strong> {{ value }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  loadSettings, 
  loadInformation, 
  loadModified, 
  loadShares,
  parseXml,
  getXmlValue,
  getXmlElements
} from '@/utils/api'

interface TestResult {
  file: string
  success: boolean
  content?: string
  error?: string
  size?: string
  parsed?: Record<string, any>
}

const isLoading = ref(false)
const testResults = ref<TestResult[]>([])
const selectedXml = ref<TestResult | null>(null)

const xmlFiles = [
  { name: 'settings.xml', loader: loadSettings },
  { name: 'information.xml', loader: loadInformation },
  { name: 'modified.xml', loader: loadModified },
  { name: 'share.xml', loader: loadShares }
]

const testAllXmlEndpoints = async () => {
  isLoading.value = true
  testResults.value = []

  for (const xmlFile of xmlFiles) {
    try {
      console.log(`Lade ${xmlFile.name}...`)
      const content = await xmlFile.loader()
      
      let parsed = {}
      try {
        const xmlDoc = parseXml(content)
        parsed = extractCommonInfo(xmlDoc, xmlFile.name)
      } catch (parseError) {
        console.warn(`Parsing-Fehler für ${xmlFile.name}:`, parseError)
      }

      testResults.value.push({
        file: xmlFile.name,
        success: true,
        content: content,
        size: formatSize(content.length),
        parsed: Object.keys(parsed).length > 0 ? parsed : undefined
      })
    } catch (error) {
      console.error(`Fehler beim Laden von ${xmlFile.name}:`, error)
      testResults.value.push({
        file: xmlFile.name,
        success: false,
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      })
    }
  }

  isLoading.value = false
}

const extractCommonInfo = (xmlDoc: Document, fileName: string): Record<string, any> => {
  const info: Record<string, any> = {}
  
  // Common tags to look for in any XML file
  const commonTags = [
    'version', 'nickname', 'port', 'downloads', 'uploads', 
    'uptime', 'users', 'files', 'downloadspeed', 'uploadspeed',
    'maxdownloads', 'maxuploads', 'downloaddir', 'tempdir'
  ]
  
  commonTags.forEach(tag => {
    const value = getXmlValue(xmlDoc, tag)
    if (value && value.trim() !== '') {
      info[tag] = value
    }
  })
  
  // Count elements
  const allElements = xmlDoc.getElementsByTagName('*')
  if (allElements.length > 0) {
    info['Gesamt-Elemente'] = allElements.length
  }
  
  // Check for specific structures based on file name
  if (fileName === 'share.xml') {
    const files = getXmlElements(xmlDoc, 'file')
    if (files.length > 0) {
      info['Geteilte Dateien'] = files.length
    }
  }
  
  if (fileName === 'modified.xml') {
    const modifications = getXmlElements(xmlDoc, 'modified')
    if (modifications.length > 0) {
      info['Änderungen'] = modifications.length
    }
  }
  
  return info
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB'
  return Math.round(bytes / (1024 * 1024)) + ' MB'
}

const showXmlContent = (result: TestResult) => {
  selectedXml.value = result
}

const clearResults = () => {
  testResults.value = []
  selectedXml.value = null
}
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-break: break-all;
}

.table th {
  border-top: none;
}
</style>