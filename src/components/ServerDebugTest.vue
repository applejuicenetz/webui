<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title mb-0">
        <i class="fas fa-server me-2"></i>
        Server Debug Test
      </h5>
    </div>
    <div class="card-body">
      <div class="alert alert-info">
        <i class="fas fa-info-circle me-2"></i>
        Dieser Test zeigt dir genau, was der Server vom Core-Server zurück bekommt.
        Prüfe die Server-Konsole für detaillierte Logs!
      </div>

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
            @click="testServerParsing" 
            :disabled="!selectedFile || isLoading"
            class="btn btn-primary w-100"
          >
            <i class="fas fa-play me-1" :class="{ 'fa-spin': isLoading }"></i>
            Server-Test
          </button>
        </div>
      </div>

      <!-- Results -->
      <div v-if="testResult" class="mt-3">
        <div class="alert" :class="testResult.success ? 'alert-success' : 'alert-danger'">
          <h6 class="alert-heading">
            <i :class="testResult.success ? 'fas fa-check' : 'fas fa-times'" class="me-2"></i>
            {{ testResult.file }} - Server Parsing Test
          </h6>
          
          <div v-if="testResult.success">
            <p><strong>Status:</strong> {{ testResult.status }}</p>
            <p><strong>Content-Type:</strong> {{ testResult.contentType }}</p>
            <p><strong>Größe:</strong> {{ testResult.size }} Zeichen</p>
            <p><strong>Ist XML:</strong> {{ testResult.isXml ? 'Ja' : 'Nein' }}</p>
            <p><strong>Beginnt mit:</strong> {{ testResult.startsWithXml ? 'XML-Tag' : 'Nicht-XML' }}</p>
          </div>
          
          <div v-else>
            <p><strong>Fehler:</strong> {{ testResult.error }}</p>
            <p><strong>Status:</strong> {{ testResult.status }}</p>
          </div>

          <div class="mt-3">
            <strong>Server-Antwort (erste 500 Zeichen):</strong>
            <pre class="bg-light p-2 border rounded mt-2 small">{{ testResult.preview }}</pre>
          </div>

          <div v-if="testResult.success && testResult.looksLikeRawHttp">
            <div class="alert alert-warning mt-3">
              <i class="fas fa-exclamation-triangle me-2"></i>
              <strong>WARNING:</strong> Die Antwort enthält noch HTTP-Headers! 
              Das Server-Parsing funktioniert nicht korrekt.
            </div>
          </div>

          <div v-if="testResult.success && testResult.isCleanXml">
            <div class="alert alert-success mt-3">
              <i class="fas fa-check-circle me-2"></i>
              <strong>SUCCESS:</strong> Sauberes XML ohne HTTP-Headers!
            </div>
          </div>
        </div>
      </div>

      <!-- Anweisungen -->
      <div class="mt-4">
        <h6>Was zu prüfen ist:</h6>
        <ul class="small">
          <li><strong>Server-Konsole:</strong> Schaue dir die detaillierten Logs an</li>
          <li><strong>HTTP-Headers:</strong> Sollten NICHT in der Antwort stehen</li>
          <li><strong>XML-Start:</strong> Antwort sollte mit <code>&lt;?xml</code> oder <code>&lt;tag</code> anfangen</li>
          <li><strong>Content-Type:</strong> Sollte <code>application/xml</code> sein</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface TestResult {
  file: string
  success: boolean
  status: number
  contentType: string
  size: number
  isXml: boolean
  startsWithXml: boolean
  isCleanXml: boolean
  looksLikeRawHttp: boolean
  preview: string
  error?: string
}

const selectedFile = ref('')
const isLoading = ref(false)
const testResult = ref<TestResult | null>(null)

const testServerParsing = async () => {
  if (!selectedFile.value) return
  
  isLoading.value = true
  testResult.value = null
  
  console.log(`Starting server debug test for ${selectedFile.value}`)
  console.log('Check the SERVER CONSOLE for detailed logs!')
  
  try {
    const response = await fetch(`/api/proxy/xml/${selectedFile.value}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const content = await response.text()
    const trimmedContent = content.trim()
    
    // Analyze the response
    const startsWithXml = trimmedContent.startsWith('<?xml') || trimmedContent.startsWith('<')
    const looksLikeRawHttp = trimmedContent.startsWith('HTTP/') || content.includes('HTTP/1.1')
    const isCleanXml = startsWithXml && !looksLikeRawHttp
    
    testResult.value = {
      file: selectedFile.value,
      success: response.ok,
      status: response.status,
      contentType: response.headers.get('content-type') || 'unknown',
      size: content.length,
      isXml: startsWithXml,
      startsWithXml: startsWithXml,
      isCleanXml: isCleanXml,
      looksLikeRawHttp: looksLikeRawHttp,
      preview: content.substring(0, 500),
      error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
    }
    
    console.log('Test Result:', testResult.value)
    
    if (looksLikeRawHttp) {
      console.error('PROBLEM: Response contains HTTP headers!')
      console.error('Raw response:', content.substring(0, 300))
    } else if (isCleanXml) {
      console.log('SUCCESS: Clean XML response!')
    } else {
      console.warn('WARNING: Response doesn\'t look like XML')
    }
    
  } catch (error) {
    console.error('Debug test error:', error)
    
    testResult.value = {
      file: selectedFile.value,
      success: false,
      status: 0,
      contentType: 'unknown',
      size: 0,
      isXml: false,
      startsWithXml: false,
      isCleanXml: false,
      looksLikeRawHttp: false,
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
  max-height: 200px;
  overflow-y: auto;
}
</style>