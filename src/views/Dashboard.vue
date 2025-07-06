<script setup>
import { ref, onMounted } from 'vue'
import { CCard, CCardBody, CCardHeader } from '@coreui/vue'
import { CRow, CCol } from '@coreui/vue'
import { CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell } from '@coreui/vue'
import { CIcon } from '@coreui/icons-vue'
import {
  cilStorage,
  cilCloudDownload,
  cilCloudUpload,
  cilFolderOpen,
  cilDiamond,
  cilNewspaper,
  cilGlobeAlt,
  cilFork
} from '@coreui/icons'
import { useRouter } from 'vue-router'

const router = useRouter()

// Dashboard-Daten
const coreData = ref({
  server: {
    name: 'www.apple-deluxe.co',
    ip: '78.134.86.179',
    description: 'Die neusten Filme immer aktuell - kommt im unseren Discord Channell'
  },
  statistics: {
    downloads: { active: 0, total: 0 },
    uploads: { active: 0 },
    shares: { size: '585.40 GB', count: 709 },
    credits: '-8.07 GB'
  },
  coreInfo: {
    serverTime: '6.7.25 - 10:57:17',
    version: '0.31.149.113',
    os: 'Linux',
    uptime: '6h 22min',
    connections: 1,
    bytesIn: '53.99 GB',
    bytesOut: '23.64 GB'
  },
  networkInfo: {
    download: '0 B',
    upload: '0 B',
    sharedUsers: 477,
    totalFiles: '3,720,742',
    totalSize: '1.19 PB'
  }
})

// Navigation functions
const navigateTo = (page) => {
  router.push(`/app/${page}`)
}

// Lifecycle
onMounted(() => {
  console.log('Dashboard mounted')
  // Hier können später echte API-Calls eingefügt werden
})
</script>

<template>
  <div class="dashboard-container">
    <CRow>
      <!-- Linke Spalte -->
      <CCol xs="12" sm="12" md="8" lg="8">
        <!-- Aktueller Server -->
        <CCard class="mb-4">
          <CCardHeader>
            <CIcon :icon="cilStorage" class="me-2" />
            aktueller Server
          </CCardHeader>
          <CCardBody>
            <h4></h4>
            <h3>{{ coreData.server.ip }}</h3>
            <br>
            {{ coreData.server.name }} - {{ coreData.server.description }}
            <br>
          </CCardBody>
        </CCard>

        <!-- Statistiken -->
        <CRow class="g-4">
          <!-- Downloads -->
          <CCol xs="12" sm="6" xl="6">
            <CCard class="overflow-hidden cursor-pointer" @click="navigateTo('downloads')">
              <CCardBody class="p-0 d-flex align-items-center">
                <div class="bg-warning text-white p-4 me-2">
                  <CIcon :icon="cilCloudDownload" class="icon-xxl" />
                </div>
                <div>
                  <div class="fs-4 fw-semibold">{{ coreData.statistics.downloads.active }}/{{ coreData.statistics.downloads.total }}</div>
                  <div class="text-body-secondary text-uppercase small">aktive Downloads</div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>

          <!-- Uploads -->
          <CCol xs="12" sm="6" xl="6">
            <CCard class="overflow-hidden cursor-pointer" @click="navigateTo('uploads')">
              <CCardBody class="p-0 d-flex align-items-center">
                <div class="bg-primary text-white p-4 me-2">
                  <CIcon :icon="cilCloudUpload" class="icon-xxl" />
                </div>
                <div>
                  <div class="fs-4 fw-semibold">{{ coreData.statistics.uploads.active }}</div>
                  <div class="text-body-secondary text-uppercase small">aktive Uploads</div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>

          <!-- Shares -->
          <CCol xs="12" sm="6" xl="6">
            <CCard class="overflow-hidden cursor-pointer" @click="navigateTo('shares')">
              <CCardBody class="p-0 d-flex align-items-center">
                <div class="bg-warning text-white p-4 me-2">
                  <CIcon :icon="cilFolderOpen" class="icon-xxl" />
                </div>
                <div>
                  <div class="fs-4 fw-semibold">{{ coreData.statistics.shares.size }}</div>
                  <div class="text-body-secondary text-uppercase small">{{ coreData.statistics.shares.count }} Dateien</div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>

          <!-- Punkte -->
          <CCol xs="12" sm="6" xl="6">
            <CCard class="overflow-hidden cursor-pointer" @click="navigateTo('extras')">
              <CCardBody class="p-0 d-flex align-items-center">
                <div class="bg-primary text-white p-4 me-2">
                  <CIcon :icon="cilDiamond" class="icon-xxl" />
                </div>
                <div>
                  <div class="fs-4 fw-semibold">
                    <span class="text-danger">{{ coreData.statistics.credits }}</span>
                  </div>
                  <div class="text-body-secondary text-uppercase small">Punkte</div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        <!-- appleJuice News -->
        <CRow class="mt-4 mb-4">
          <CCol xs="12" sm="12" md="12" lg="12">
            <CCard>
              <CCardHeader>
                <CIcon :icon="cilNewspaper" class="me-2" />
                appleJuice News
              </CCardHeader>
              <CCardBody>
                <ul>
                  <li><a href="https://applejuicenetz.github.io/faq/" target="_blank">appleJuice FAQ</a></li>
                  <li><a href="https://discord.gg/AmQQdB6mYQ" target="_blank">appleJuice WebChat (Discord)</a></li>
                </ul>
                <ul>
                  <li><a href="https://applejuicenetz.github.io/downloads/applejuice-browser-erweiterung/" target="_blank">appleJuice Browser Erweiterung</a></li>
                  <li><a href="https://applejuicenetz.github.io/downloads/applejuice-windows/" target="_blank">appleJuice Windows Setup (32bit und 64bit)</a></li>
                  <li><a href="https://applejuicenetz.github.io/downloads/applejuice-portable/" target="_blank">appleJuice Portable (32bit und 64bit)</a></li>
                  <li><a href="https://applejuicenetz.github.io/downloads/applejuice-macos/" target="_blank">appleJuice als native macOS Apps</a></li>
                  <li><a href="https://applejuicenetz.github.io/downloads/applejuice-linux/" target="_blank">appleJuice als Linux Apps im Snapcraft Store</a></li>
                </ul>
                <ul>
                  <li><strong>Bleib auf dem Laufenden, abonnier die <a href="https://bit.ly/applejuiceinfo" style="color:red" target="_blank">Community News</a>!</strong></li>
                </ul>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CCol>

      <!-- Rechte Spalte -->
      <CCol xs="12" sm="12" md="4" lg="4">
        <!-- Core Informationen -->
        <CCard class="mb-4">
          <CCardHeader>
            <CIcon :icon="cilGlobeAlt" class="me-2" />
            Core Informationen
          </CCardHeader>
          <CCardBody class="p-0">
            <CTable>
              <CTableBody>
                <CTableRow>
                  <CTableDataCell>Server Zeit</CTableDataCell>
                  <CTableDataCell>{{ coreData.coreInfo.serverTime }}</CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableDataCell style="white-space: nowrap;">Core Version</CTableDataCell>
                  <CTableDataCell>{{ coreData.coreInfo.version }}</CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableDataCell style="white-space: nowrap;">Betriebssystem</CTableDataCell>
                  <CTableDataCell style="white-space: nowrap;">
                    <img width="16" height="16" src="" alt="linux" class="me-1">
                    {{ coreData.coreInfo.os }}
                  </CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableDataCell style="white-space: nowrap;">verbunden seit</CTableDataCell>
                  <CTableDataCell style="white-space: nowrap;">{{ coreData.coreInfo.uptime }}</CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableDataCell style="white-space: nowrap;">Verbindungen</CTableDataCell>
                  <CTableDataCell style="white-space: nowrap;">{{ coreData.coreInfo.connections }}</CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableDataCell style="white-space: nowrap;">Bytes in</CTableDataCell>
                  <CTableDataCell style="white-space: nowrap;">{{ coreData.coreInfo.bytesIn }}</CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableDataCell style="white-space: nowrap;">Bytes out</CTableDataCell>
                  <CTableDataCell style="white-space: nowrap;">{{ coreData.coreInfo.bytesOut }}</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>

        <!-- Netzwerk Informationen -->
        <CCard class="mb-4">
          <CCardHeader>
            <CIcon :icon="cilFork" class="me-2" />
            Netzwerk Informationen
          </CCardHeader>
          <CCardBody class="p-0">
            <CTable>
              <CTableBody>
                <CTableRow>
                  <CTableDataCell style="white-space: nowrap;">Download</CTableDataCell>
                  <CTableDataCell style="white-space: nowrap;">{{ coreData.networkInfo.download }}</CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableDataCell style="white-space: nowrap;">Upload</CTableDataCell>
                  <CTableDataCell style="white-space: nowrap;">{{ coreData.networkInfo.upload }}</CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableDataCell style="white-space: nowrap;">Shared User</CTableDataCell>
                  <CTableDataCell style="white-space: nowrap;">{{ coreData.networkInfo.sharedUsers }}</CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableDataCell style="white-space: nowrap;">gesamte Dateien</CTableDataCell>
                  <CTableDataCell style="white-space: nowrap;">
                    {{ coreData.networkInfo.totalFiles }}<br>
                    {{ coreData.networkInfo.totalSize }}
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
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

/* Responsive Anpassungen */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
  }

  .icon-xxl {
    font-size: 2rem;
  }
}
</style>
