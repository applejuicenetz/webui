<template>
  <div class="server-page">
    <CContainer fluid>
      <CRow>
        <CCol :lg="8">
          <CCard>
            <CCardHeader>
              <h4 class="mb-0">
                <CIcon icon="cil-settings" class="me-2" />
                Server Status
              </h4>
            </CCardHeader>
            <CCardBody>
              <CRow class="mb-4">
                <CCol :sm="6" :lg="3" class="mb-3">
                  <CCard color="success" text-color="white">
                    <CCardBody class="text-center">
                      <CIcon icon="cil-power-standby" size="xl" class="mb-2" />
                      <h4>{{ serverStatus.status }}</h4>
                      <small>Server Status</small>
                    </CCardBody>
                  </CCard>
                </CCol>
                <CCol :sm="6" :lg="3" class="mb-3">
                  <CCard color="info" text-color="white">
                    <CCardBody class="text-center">
                      <CIcon icon="cil-people" size="xl" class="mb-2" />
                      <h4>{{ serverStatus.connections }}</h4>
                      <small>Active Connections</small>
                    </CCardBody>
                  </CCard>
                </CCol>
                <CCol :sm="6" :lg="3" class="mb-3">
                  <CCard color="warning" text-color="white">
                    <CCardBody class="text-center">
                      <CIcon icon="cil-speedometer" size="xl" class="mb-2" />
                      <h4>{{ serverStatus.uptime }}</h4>
                      <small>Uptime</small>
                    </CCardBody>
                  </CCard>
                </CCol>
                <CCol :sm="6" :lg="3" class="mb-3">
                  <CCard color="primary" text-color="white">
                    <CCardBody class="text-center">
                      <CIcon icon="cil-data-transfer-up" size="xl" class="mb-2" />
                      <h4>{{ serverStatus.port }}</h4>
                      <small>Server Port</small>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>

              <CRow>
                <CCol :md="6">
                  <h5>Server Controls</h5>
                  <div class="d-grid gap-2 mb-3">
                    <CButton 
                      color="success" 
                      size="lg"
                      @click="startServer"
                      :disabled="serverStatus.status === 'Online'"
                    >
                      <CIcon icon="cil-media-play" class="me-2" />
                      Start Server
                    </CButton>
                    <CButton 
                      color="danger" 
                      size="lg"
                      @click="stopServer"
                      :disabled="serverStatus.status === 'Offline'"
                    >
                      <CIcon icon="cil-media-stop" class="me-2" />
                      Stop Server
                    </CButton>
                    <CButton 
                      color="warning" 
                      size="lg"
                      @click="restartServer"
                      :disabled="serverStatus.status === 'Offline'"
                    >
                      <CIcon icon="cil-reload" class="me-2" />
                      Restart Server
                    </CButton>
                  </div>
                </CCol>
                <CCol :md="6">
                  <h5>Server Information</h5>
                  <CTable>
                    <CTableBody>
                      <CTableRow>
                        <CTableDataCell><strong>Server Name:</strong></CTableDataCell>
                        <CTableDataCell>{{ serverInfo.name }}</CTableDataCell>
                      </CTableRow>
                      <CTableRow>
                        <CTableDataCell><strong>Version:</strong></CTableDataCell>
                        <CTableDataCell>{{ serverInfo.version }}</CTableDataCell>
                      </CTableRow>
                      <CTableRow>
                        <CTableDataCell><strong>Max Connections:</strong></CTableDataCell>
                        <CTableDataCell>{{ serverInfo.maxConnections }}</CTableDataCell>
                      </CTableRow>
                      <CTableRow>
                        <CTableDataCell><strong>Network:</strong></CTableDataCell>
                        <CTableDataCell>{{ serverInfo.network }}</CTableDataCell>
                      </CTableRow>
                    </CTableBody>
                  </CTable>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol :lg="4">
          <CCard>
            <CCardHeader>
              <h5 class="mb-0">Server Log</h5>
            </CCardHeader>
            <CCardBody>
              <div class="server-log" style="height: 400px; overflow-y: auto; background: #f8f9fa; padding: 10px; font-family: monospace; font-size: 12px;">
                <div v-for="(log, index) in serverLogs" :key="index" class="log-entry">
                  <span class="text-muted">[{{ log.timestamp }}]</span>
                  <span :class="getLogClass(log.level)">{{ log.level }}:</span>
                  {{ log.message }}
                </div>
              </div>
              <div class="mt-2">
                <CButton size="sm" color="secondary" @click="clearLogs">
                  Clear Logs
                </CButton>
                <CButton size="sm" color="primary" @click="refreshLogs" class="ms-2">
                  Refresh
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'Server',
  setup() {
    const serverStatus = ref({
      status: 'Online',
      connections: 42,
      uptime: '2d 14h 23m',
      port: 4661
    })

    const serverInfo = ref({
      name: 'AppleJuice Server',
      version: '1.2.3',
      maxConnections: 200,
      network: 'AppleJuice Network'
    })

    const serverLogs = ref([
      {
        timestamp: new Date().toLocaleTimeString(),
        level: 'INFO',
        message: 'Server started successfully'
      },
      {
        timestamp: new Date().toLocaleTimeString(),
        level: 'INFO',
        message: 'Listening on port 4661'
      },
      {
        timestamp: new Date().toLocaleTimeString(),
        level: 'WARN',
        message: 'High memory usage detected'
      }
    ])

    let logInterval = null

    const startServer = () => {
      serverStatus.value.status = 'Online'
      addLog('INFO', 'Server started')
    }

    const stopServer = () => {
      serverStatus.value.status = 'Offline'
      serverStatus.value.connections = 0
      addLog('INFO', 'Server stopped')
    }

    const restartServer = () => {
      addLog('INFO', 'Server restarting...')
      serverStatus.value.status = 'Restarting'
      setTimeout(() => {
        serverStatus.value.status = 'Online'
        addLog('INFO', 'Server restarted successfully')
      }, 2000)
    }

    const addLog = (level, message) => {
      serverLogs.value.unshift({
        timestamp: new Date().toLocaleTimeString(),
        level,
        message
      })
      if (serverLogs.value.length > 100) {
        serverLogs.value.pop()
      }
    }

    const getLogClass = (level) => {
      switch (level) {
        case 'ERROR': return 'text-danger'
        case 'WARN': return 'text-warning'
        case 'INFO': return 'text-info'
        default: return 'text-secondary'
      }
    }

    const clearLogs = () => {
      serverLogs.value = []
    }

    const refreshLogs = () => {
      addLog('INFO', 'Logs refreshed')
    }

    onMounted(() => {
      // Simulate periodic log updates
      logInterval = setInterval(() => {
        const messages = [
          'Connection established from 192.168.1.100',
          'File transfer completed',
          'Search request processed',
          'Connection closed'
        ]
        const levels = ['INFO', 'WARN', 'ERROR']
        const randomMessage = messages[Math.floor(Math.random() * messages.length)]
        const randomLevel = levels[Math.floor(Math.random() * levels.length)]
        addLog(randomLevel, randomMessage)
      }, 5000)
    })

    onUnmounted(() => {
      if (logInterval) {
        clearInterval(logInterval)
      }
    })

    return {
      serverStatus,
      serverInfo,
      serverLogs,
      startServer,
      stopServer,
      restartServer,
      getLogClass,
      clearLogs,
      refreshLogs
    }
  }
}
</script>

<style scoped>
.log-entry {
  margin-bottom: 2px;
  line-height: 1.2;
}
</style>