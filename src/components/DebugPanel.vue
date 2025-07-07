<!--
  Debug Panel Komponente
  Zeigt detaillierte Informationen über Core-Verbindung und XML-Parsing
-->

<template>
  <CCard v-if="showDebug" class="mb-4">
    <CCardHeader>
      <div class="d-flex justify-content-between align-items-center">
        <h6 class="mb-0">
          <CIcon icon="cil-bug" class="me-2" />
          Debug Information
        </h6>
        <CButton @click="$emit('close')" variant="ghost" size="sm">
          <CIcon icon="cil-x" />
        </CButton>
      </div>
    </CCardHeader>
    <CCardBody>
      <CRow>
        <CCol xs="12" md="6">
          <h6>Verbindungsstatus</h6>
          <ul class="list-unstyled small">
            <li><strong>Status:</strong> {{ connectionStatus }}</li>
            <li><strong>Letzte Aktualisierung:</strong> {{ lastUpdate }}</li>
            <li><strong>Retry Count:</strong> {{ retryCount }}</li>
            <li><strong>Auto-Update:</strong> {{ autoUpdateEnabled ? 'Aktiv' : 'Inaktiv' }}</li>
          </ul>
        </CCol>
        <CCol xs="12" md="6">
          <h6>Endpoint Status</h6>
          <div v-if="endpointStatus">
            <div v-for="(status, endpoint) in endpointStatus" :key="endpoint" class="small">
              <CBadge :color="status.success ? 'success' : 'danger'" class="me-1">
                {{ endpoint }}
              </CBadge>
              <span v-if="!status.success" class="text-muted">{{ status.error }}</span>
            </div>
          </div>
        </CCol>
      </CRow>
      
      <CRow v-if="errors && errors.length > 0" class="mt-3">
        <CCol xs="12">
          <h6>Aktuelle Fehler</h6>
          <div class="alert alert-warning">
            <ul class="mb-0">
              <li v-for="error in errors" :key="error" class="small">{{ error }}</li>
            </ul>
          </div>
        </CCol>
      </CRow>
      
      <CRow v-if="xmlPreview" class="mt-3">
        <CCol xs="12">
          <h6>XML Preview (letzte 200 Zeichen)</h6>
          <pre class="small bg-light p-2 rounded">{{ xmlPreview }}</pre>
        </CCol>
      </CRow>
    </CCardBody>
  </CCard>
</template>

<script setup>
import { computed } from 'vue'
import { CCard, CCardBody, CCardHeader, CButton, CBadge, CRow, CCol } from '@coreui/vue'

const props = defineProps({
  showDebug: {
    type: Boolean,
    default: false
  },
  connectionStatus: {
    type: String,
    default: 'Unbekannt'
  },
  lastUpdate: {
    type: String,
    default: 'Nie'
  },
  retryCount: {
    type: Number,
    default: 0
  },
  autoUpdateEnabled: {
    type: Boolean,
    default: false
  },
  errors: {
    type: Array,
    default: () => []
  },
  endpointStatus: {
    type: Object,
    default: () => null
  },
  xmlPreview: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close'])
</script>

<style scoped>
.small {
  font-size: 0.875rem;
}
</style>