<template>
  <div class="downloads-page">
    <CContainer fluid>
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>
              <h4 class="mb-0">
                <CIcon icon="cil-cloud-download" class="me-2" />
                Downloads
              </h4>
            </CCardHeader>
            <CCardBody>
              <CRow class="mb-3">
                <CCol :md="6">
                  <CInputGroup>
                    <CFormInput 
                      v-model="searchTerm"
                      placeholder="Search downloads..."
                    />
                    <CButton color="primary" variant="outline">
                      <CIcon icon="cil-magnifying-glass" />
                    </CButton>
                  </CInputGroup>
                </CCol>
                <CCol :md="6" class="text-end">
                  <CButton color="success" @click="refreshDownloads">
                    <CIcon icon="cil-reload" class="me-1" />
                    Refresh
                  </CButton>
                </CCol>
              </CRow>
              
              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>File Name</CTableHeaderCell>
                    <CTableHeaderCell>Size</CTableHeaderCell>
                    <CTableHeaderCell>Progress</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  <CTableRow v-for="download in filteredDownloads" :key="download.id">
                    <CTableDataCell>{{ download.fileName }}</CTableDataCell>
                    <CTableDataCell>{{ download.size }}</CTableDataCell>
                    <CTableDataCell>
                      <CProgress :value="download.progress" />
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge :color="getStatusColor(download.status)">
                        {{ download.status }}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton 
                        size="sm" 
                        color="primary" 
                        variant="ghost"
                        @click="pauseResume(download)"
                      >
                        <CIcon :icon="download.status === 'downloading' ? 'cil-media-pause' : 'cil-media-play'" />
                      </CButton>
                      <CButton 
                        size="sm" 
                        color="danger" 
                        variant="ghost"
                        @click="cancelDownload(download)"
                      >
                        <CIcon icon="cil-x" />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>
              
              <div v-if="filteredDownloads.length === 0" class="text-center py-4">
                <CIcon icon="cil-inbox" size="xl" class="text-muted mb-2" />
                <p class="text-muted">No downloads found</p>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'Downloads',
  setup() {
    const searchTerm = ref('')
    const downloads = ref([
      {
        id: 1,
        fileName: 'example-file.zip',
        size: '25.4 MB',
        progress: 75,
        status: 'downloading'
      },
      {
        id: 2,
        fileName: 'document.pdf',
        size: '2.1 MB',
        progress: 100,
        status: 'completed'
      },
      {
        id: 3,
        fileName: 'video.mp4',
        size: '150.2 MB',
        progress: 45,
        status: 'paused'
      }
    ])

    const filteredDownloads = computed(() => {
      if (!searchTerm.value) return downloads.value
      return downloads.value.filter(download => 
        download.fileName.toLowerCase().includes(searchTerm.value.toLowerCase())
      )
    })

    const getStatusColor = (status) => {
      switch (status) {
        case 'completed': return 'success'
        case 'downloading': return 'primary'
        case 'paused': return 'warning'
        case 'failed': return 'danger'
        default: return 'secondary'
      }
    }

    const refreshDownloads = () => {
      // Implement refresh logic
      console.log('Refreshing downloads...')
    }

    const pauseResume = (download) => {
      if (download.status === 'downloading') {
        download.status = 'paused'
      } else if (download.status === 'paused') {
        download.status = 'downloading'
      }
    }

    const cancelDownload = (download) => {
      const index = downloads.value.findIndex(d => d.id === download.id)
      if (index > -1) {
        downloads.value.splice(index, 1)
      }
    }

    return {
      searchTerm,
      downloads,
      filteredDownloads,
      getStatusColor,
      refreshDownloads,
      pauseResume,
      cancelDownload
    }
  }
}
</script>