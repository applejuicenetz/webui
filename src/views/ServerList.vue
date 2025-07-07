<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { CCard, CCardBody, CCardHeader } from '@coreui/vue'
import { CRow, CCol } from '@coreui/vue'
import { CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell } from '@coreui/vue'
import { CIcon } from '@coreui/icons-vue'
import { CSpinner, CBadge, CButton } from '@coreui/vue'
import {
  cilGlobeAlt,
  cilReload,
  cilCheckCircle,
  cilXCircle,
  cilWarning
} from '@coreui/icons'
import { useRouter } from 'vue-router'
import { useCoreStore } from '../stores/core.js'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const coreStore = useCoreStore()
const authStore = useAuthStore()

// Reactive data
const lastUpdateTime = ref(new Date())
const error = ref(null)

// Computed properties
const coreData = computed(() => coreStore.coreData)
const isLoading = computed(() => coreStore.isLoading)
const servers = computed(() => coreData.value.networkInfo.servers || [])
const onlineServers = computed(() => servers.value.filter(s => s.isOnline))
const offlineServers = computed(() => servers.value.filter(s => !s.isOnline))

// Statistics
const serverStats = computed(() => ({
  total: servers.value.length,
  online: onlineServers.value.length,
  offline: offlineServers.value.length,
  highTries: servers.value.filter(s => s.connectiontry > 10).length
}))

// Manual refresh function
const refreshData = async () => {
  try {
    error.value = null
    await coreStore.refresh()
    lastUpdateTime.value = new Date()
  } catch (err) {
    error.value = err.message
    console.error('Server list refresh error:', err)
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
    await coreStore.loadCoreData()
    lastUpdateTime.value = new Date()
  } catch (err) {
    error.value = err.message
    console.error('Server list initialization error:', err)

    // If authentication error, redirect to login
    if (err.message.includes('Wrong password') ||
        err.message.includes('Not authenticated')) {
      router.push('/login')
    }
  }
}

// Get server status icon
const getServerIcon = (server) => {
  if (server.isOnline) return cilCheckCircle
  if (server.connectiontry > 10) return cilXCircle
  if (server.connectiontry > 5) return cilWarning
  return cilXCircle
}

// Get server status color
const getServerColor = (server) => {
  if (server.isOnline) return 'success'
  if (server.connectiontry > 10) return 'danger'
  if (server.connectiontry > 5) return 'warning'
  return 'secondary'
}

// Lifecycle
onMounted(() => {
  console.log('Server list mounted')
  initializeData()
})

onUnmounted(() => {
  // Component cleanup if needed
})
</script>

<template>
  <div class="server-list-container">
    <CRow>
      <CCol xs="12">
        <!-- Header -->
        <CCard class="mb-4">
          <CCardHeader class="d-flex justify-content-between align-items-center">
            <div>
              <CIcon :icon="cilGlobeAlt" class="me-2" />
              AppleJuice Server-Liste
            </div>
            <div class="d-flex align-items-center">
              <CButton
                :disabled="isLoading"
                @click="refreshData"
                variant="outline"
                color="primary"
                size="sm"
                class="me-2"
              >
                <CSpinner v-if="isLoading" size="sm" class="me-1" />
                <CIcon v-else :icon="cilReload" class="me-1" />
                Aktualisieren
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <div v-if="error" class="alert alert-danger">
              <strong>Fehler:</strong> {{ error }}
            </div>
            <div v-else>
              <CRow class="text-center">
                <CCol xs="3">
                  <div class="fw-semibold fs-4">{{ serverStats.total }}</div>
                  <div class="text-muted">Gesamt</div>
                </CCol>
                <CCol xs="3">
                  <div class="fw-semibold fs-4 text-success">{{ serverStats.online }}</div>
                  <div class="text-muted">Online</div>
                </CCol>
                <CCol xs="3">
                  <div class="fw-semibold fs-4 text-secondary">{{ serverStats.offline }}</div>
                  <div class="text-muted">Offline</div>
                </CCol>
                <CCol xs="3">
                  <div class="fw-semibold fs-4 text-danger">{{ serverStats.highTries }}</div>
                  <div class="text-muted">Probleme</div>
                </CCol>
              </CRow>
            </div>
          </CCardBody>
        </CCard>

        <!-- Server Liste -->
        <CCard v-if="servers.length > 0">
          <CCardHeader>
            <CIcon :icon="cilGlobeAlt" class="me-2" />
            Server Details ({{ servers.length }})
          </CCardHeader>
          <CCardBody class="p-0">
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style="width: 80px;">Status</CTableHeaderCell>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Host</CTableHeaderCell>
                  <CTableHeaderCell style="width: 100px;">Port</CTableHeaderCell>
                  <CTableHeaderCell>Letzte Verbindung</CTableHeaderCell>
                  <CTableHeaderCell style="width: 120px;">Versuche</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="server in servers" :key="server.id">
                  <CTableDataCell>
                    <div class="d-flex align-items-center">
                      <CIcon 
                        :icon="getServerIcon(server)" 
                        :class="`text-${getServerColor(server)} me-2`"
                      />
                      <CBadge :color="getServerColor(server)">
                        {{ server.status }}
                      </CBadge>
                    </div>
                  </CTableDataCell>
                  <CTableDataCell>
                    <div class="d-flex flex-column">
                      <span class="fw-semibold">
                        {{ server.name || 'Unnamed Server' }}
                      </span>
                      <small class="text-muted">ID: {{ server.id }}</small>
                    </div>
                  </CTableDataCell>
                  <CTableDataCell>
                    <code class="text-primary">{{ server.host }}</code>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="info">{{ server.port }}</CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <span :class="server.isOnline ? 'text-success fw-semibold' : 'text-muted'">
                      {{ server.lastSeenFormatted }}
                    </span>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CBadge 
                      :color="server.connectiontry > 10 ? 'danger' : server.connectiontry > 5 ? 'warning' : 'secondary'"
                      class="px-2"
                    >
                      {{ server.connectiontry }}
                    </CBadge>
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>

        <!-- Keine Server -->
        <CCard v-else-if="!isLoading">
          <CCardBody class="text-center py-5">
            <CIcon :icon="cilGlobeAlt" class="text-muted mb-3" size="xl" />
            <h4 class="text-muted">Keine Server-Daten verfügbar</h4>
            <p class="text-muted">
              Die Server-Liste konnte nicht geladen werden. Bitte versuchen Sie es später erneut.
            </p>
            <CButton @click="refreshData" color="primary" variant="outline">
              <CIcon :icon="cilReload" class="me-2" />
              Erneut laden
            </CButton>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<style scoped>
.server-list-container {
  padding: 20px;
}

.fw-semibold {
  font-weight: 600;
}

code {
  font-size: 0.9em;
  padding: 2px 4px;
  border-radius: 3px;
  background-color: rgba(0, 0, 0, 0.05);
}
</style>