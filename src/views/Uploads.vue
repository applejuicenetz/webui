<template>
  <div class="uploads-page">
    <CContainer fluid>
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>
              <h4 class="mb-0">
                <CIcon icon="cil-cloud-upload" class="me-2" />
                Uploads
              </h4>
            </CCardHeader>
            <CCardBody>
              <CRow class="mb-4">
                <CCol>
                  <CCard color="light">
                    <CCardBody class="text-center py-5">
                      <CIcon icon="cil-cloud-upload" size="xl" class="text-primary mb-3" />
                      <h5>Drop files here to upload</h5>
                      <p class="text-muted">or</p>
                      <CButton color="primary" @click="selectFiles">
                        Select Files
                      </CButton>
                      <input 
                        ref="fileInput" 
                        type="file" 
                        multiple 
                        style="display: none" 
                        @change="handleFileSelect"
                      />
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>

              <CRow v-if="uploads.length > 0">
                <CCol>
                  <h5 class="mb-3">Upload Queue</h5>
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
                      <CTableRow v-for="upload in uploads" :key="upload.id">
                        <CTableDataCell>{{ upload.fileName }}</CTableDataCell>
                        <CTableDataCell>{{ formatFileSize(upload.size) }}</CTableDataCell>
                        <CTableDataCell>
                          <CProgress :value="upload.progress" />
                          <small class="text-muted">{{ upload.progress }}%</small>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge :color="getStatusColor(upload.status)">
                            {{ upload.status }}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton 
                            size="sm" 
                            color="primary" 
                            variant="ghost"
                            @click="pauseResume(upload)"
                            v-if="upload.status === 'uploading' || upload.status === 'paused'"
                          >
                            <CIcon :icon="upload.status === 'uploading' ? 'cil-media-pause' : 'cil-media-play'" />
                          </CButton>
                          <CButton 
                            size="sm" 
                            color="danger" 
                            variant="ghost"
                            @click="cancelUpload(upload)"
                            v-if="upload.status !== 'completed'"
                          >
                            <CIcon icon="cil-x" />
                          </CButton>
                          <CButton 
                            size="sm" 
                            color="success" 
                            variant="ghost"
                            @click="retryUpload(upload)"
                            v-if="upload.status === 'failed'"
                          >
                            <CIcon icon="cil-reload" />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    </CTableBody>
                  </CTable>
                </CCol>
              </CRow>

              <CRow class="mt-4" v-if="uploads.length > 0">
                <CCol>
                  <CCard>
                    <CCardBody>
                      <h6>Upload Statistics</h6>
                      <CRow>
                        <CCol :sm="3">
                          <strong>Total Files:</strong> {{ uploads.length }}
                        </CCol>
                        <CCol :sm="3">
                          <strong>Completed:</strong> {{ completedUploads }}
                        </CCol>
                        <CCol :sm="3">
                          <strong>Uploading:</strong> {{ activeUploads }}
                        </CCol>
                        <CCol :sm="3">
                          <strong>Failed:</strong> {{ failedUploads }}
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
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
  name: 'Uploads',
  setup() {
    const fileInput = ref(null)
    const uploads = ref([])

    const completedUploads = computed(() => 
      uploads.value.filter(u => u.status === 'completed').length
    )
    
    const activeUploads = computed(() => 
      uploads.value.filter(u => u.status === 'uploading').length
    )
    
    const failedUploads = computed(() => 
      uploads.value.filter(u => u.status === 'failed').length
    )

    const selectFiles = () => {
      fileInput.value.click()
    }

    const handleFileSelect = (event) => {
      const files = Array.from(event.target.files)
      files.forEach(file => {
        const upload = {
          id: Date.now() + Math.random(),
          fileName: file.name,
          size: file.size,
          progress: 0,
          status: 'queued',
          file: file
        }
        uploads.value.push(upload)
        startUpload(upload)
      })
    }

    const startUpload = (upload) => {
      upload.status = 'uploading'
      // Simulate upload progress
      const interval = setInterval(() => {
        upload.progress += Math.random() * 10
        if (upload.progress >= 100) {
          upload.progress = 100
          upload.status = 'completed'
          clearInterval(interval)
        }
      }, 500)
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const getStatusColor = (status) => {
      switch (status) {
        case 'completed': return 'success'
        case 'uploading': return 'primary'
        case 'paused': return 'warning'
        case 'failed': return 'danger'
        case 'queued': return 'secondary'
        default: return 'secondary'
      }
    }

    const pauseResume = (upload) => {
      if (upload.status === 'uploading') {
        upload.status = 'paused'
      } else if (upload.status === 'paused') {
        upload.status = 'uploading'
        startUpload(upload)
      }
    }

    const cancelUpload = (upload) => {
      const index = uploads.value.findIndex(u => u.id === upload.id)
      if (index > -1) {
        uploads.value.splice(index, 1)
      }
    }

    const retryUpload = (upload) => {
      upload.progress = 0
      upload.status = 'uploading'
      startUpload(upload)
    }

    return {
      fileInput,
      uploads,
      completedUploads,
      activeUploads,
      failedUploads,
      selectFiles,
      handleFileSelect,
      formatFileSize,
      getStatusColor,
      pauseResume,
      cancelUpload,
      retryUpload
    }
  }
}
</script>