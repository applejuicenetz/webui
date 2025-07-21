<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title mb-0">
        <i class="fas fa-bug me-2"></i>
        XML Debug Tool
      </h5>
    </div>
    <div class="card-body">
      <div class="row g-2 mb-3">
        <div class="col-md-8">
          <select v-model="selectedFile" class="form-select">
            <option value="">Wähle XML-Datei...</option>
            <option value="settings.xml">settings.xml</option>
            <option value="information.xml">information.xml</option>
            <option value="modified.xml">modified.xml</option>
            <option value="share.xml">share.xml</option>
          </select>
        </div>
        <div class="col-md-4">
          <button 
            @click="testSingleFile" 
            :disabled="!selectedFile || isLoading"
            class="btn btn-primary w-100"
          >
            <i class="fas fa-play me-1" :class="{ 'fa-spin': isLoading }"></i>
            Test
          </button>
        </div>
      </div>

      <!-- Results -->
      <div v-if="debugResult" class="mt-3">
        <div class="alert" :class="debugResult.success ? 'alert-success' : 'alert-danger'">
          <h6 class="alert-heading">
            <i :class="debugResult.success ? 'fas fa-check' : 'fas fa-times'" class="me-2"></i>
            {{ debugResult.file }}
          </h6>
          
          <div v-if="debugResult.success">
            <p><strong>Status:</strong> {{ debugResult.status }}</p>
            <p><strong>Content-Type:</strong> {{ debugResult.contentType }}</p>
            <p><strong>Größe:</strong> {{ debugResult.size }} Zeichen</p>
            <p><strong>Ist XML:</strong> {{ debugResult.isXml ? 'Ja' : 'Nein' }}</p>
          </div>
          
          <div v-else>
            <p><strong>Fehler:</strong> {{ debugResult.error }}</p>
            <p><strong>Status:</strong> {{ debugResult.status }}</p>
          </div>
        </div>

        <!-- Raw Content -->
        <div class="mt-3">
          <h6>Antwort-Inhalt (erste 500 Zeichen):</h6>
          <pre class="bg-light p-3 border rounded small" style="max-height: 200px; overflow-y: auto;">{{ debugResult.preview }}</pre>
          
          <div v-if="debugResult.success && debugResult.fullContent" class="mt-2">
            <button @click="showFullContent = !showFullContent" class="btn btn-outline-secondary btn-sm">
              {{ showFullContent ? 'Vollständigen Inhalt ausblenden' : 'Vollständigen Inhalt anzeigen' }}
            </button>
            
            <div v-if="showFullContent" class="mt-2">
              <pre class="bg-light p-3 border rounded small" style="max-height: 400px; overflow-y: auto;">{{ debugResult.fullContent }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface DebugResult {
  file: string
  success: boolean
  status: number
  contentType: string
  size: number
  isXml: boolean
  preview: string
  fullContent?: string
  error?: string
}

const selectedFile = ref('')
const isLoading = ref(false)
const debugResult = ref<DebugResult | null>(null)
const showFullContent = ref(false)

const testSingleFile = async () => {
  if (!selectedFile.value) return
  
  isLoading.value = true
  debugResult.value = null
  showFullContent.value = false
  
  try {
    console.log(`🔍 Teste ${selectedFile.value}...`)
    
    const response = await fetch(`/api/proxy/xml/${selectedFile.value}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const content = await response.text()
    const isXml = content.trim().startsWith('<')
    
    debugResult.value = {
      file: selectedFile.value,
      success: response.ok,
      status: response.status,
      contentType: response.headers.get('content-type') || 'unknown',
      size: content.length,
      isXml: isXml,
      preview: content.substring(0, 500),
      fullContent: response.ok ? content : undefined,
      error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
    }
    
    console.log('Debug Result:', debugResult.value)
    
  } catch (error) {
    console.error('Debug Error:', error)
    
    debugResult.value = {
      file: selectedFile.value,
      success: false,
      status: 0,
      contentType: 'unknown',
      size: 0,
      isXml: false,
      preview: '',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 0.8rem;
}
</style>