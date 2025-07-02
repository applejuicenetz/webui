<template>
  <div class="shares-page">
    <CContainer fluid>
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>
              <CRow class="align-items-center">
                <CCol>
                  <h4 class="mb-0">
                    <CIcon icon="cil-folder-open" class="me-2" />
                    Shared Files
                  </h4>
                </CCol>
                <CCol class="text-end">
                  <CButton color="primary" @click="refreshShares">
                    <CIcon icon="cil-reload" class="me-1" />
                    Refresh
                  </CButton>
                  <CButton color="success" class="ms-2" @click="addShare">
                    <CIcon icon="cil-plus" class="me-1" />
                    Add Share
                  </CButton>
                </CCol>
              </CRow>
            </CCardHeader>
            <CCardBody>
              <CRow class="mb-3">
                <CCol :md="6">
                  <CInputGroup>
                    <CFormInput 
                      v-model="searchTerm"
                      placeholder="Search shared files..."
                    />
                    <CButton color="primary" variant="outline">
                      <CIcon icon="cil-magnifying-glass" />
                    </CButton>
                  </CInputGroup>
                </CCol>
                <CCol :md="3">
                  <CFormSelect v-model="filterType">
                    <option value="">All Types</option>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                    <option value="image">Image</option>
                    <option value="other">Other</option>
                  </CFormSelect>
                </CCol>
                <CCol :md="3">
                  <CFormSelect v-model="sortBy">
                    <option value="name">Sort by Name</option>
                    <option value="size">Sort by Size</option>
                    <option value="type">Sort by Type</option>
                    <option value="date">Sort by Date</option>
                  </CFormSelect>
                </CCol>
              </CRow>

              <CRow class="mb-3">
                <CCol>
                  <CCard color="light">
                    <CCardBody>
                      <CRow>
                        <CCol :sm="3">
                          <div class="text-center">
                            <h4 class="text-primary">{{ shareStats.totalFiles }}</h4>
                            <small class="text-muted">Total Files</small>
                          </div>
                        </CCol>
                        <CCol :sm="3">
                          <div class="text-center">
                            <h4 class="text-success">{{ shareStats.totalSize }}</h4>
                            <small class="text-muted">Total Size</small>
                          </div>
                        </CCol>
                        <CCol :sm="3">
                          <div class="text-center">
                            <h4 class="text-info">{{ shareStats.sharedDirs }}</h4>
                            <small class="text-muted">Shared Directories</small>
                          </div>
                        </CCol>
                        <CCol :sm="3">
                          <div class="text-center">
                            <h4 class="text-warning">{{ shareStats.requests }}</h4>
                            <small class="text-muted">Today's Requests</small>
                          </div>
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>

              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>
                      <CFormCheck @change="toggleSelectAll" />
                    </CTableHeaderCell>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Type</CTableHeaderCell>
                    <CTableHeaderCell>Size</CTableHeaderCell>
                    <CTableHeaderCell>Path</CTableHeaderCell>
                    <CTableHeaderCell>Requests</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  <CTableRow v-for="file in filteredShares" :key="file.id">
                    <CTableDataCell>
                      <CFormCheck v-model="file.selected" />
                    </CTableDataCell>
                    <CTableDataCell>
                      <div class="d-flex align-items-center">
                        <CIcon :icon="getFileIcon(file.type)" class="me-2" />
                        {{ file.name }}
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge :color="getTypeColor(file.type)">
                        {{ file.type }}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>{{ file.size }}</CTableDataCell>
                    <CTableDataCell>
                      <small class="text-muted">{{ file.path }}</small>
                    </CTableDataCell>
                    <CTableDataCell>{{ file.requests }}</CTableDataCell>
                    <CTableDataCell>
                      <CButton 
                        size="sm" 
                        color="primary" 
                        variant="ghost"
                        @click="openFile(file)"
                      >
                        <CIcon icon="cil-external-link" />
                      </CButton>
                      <CButton 
                        size="sm" 
                        color="danger" 
                        variant="ghost"
                        @click="removeShare(file)"
                      >
                        <CIcon icon="cil-trash" />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>

              <div v-if="filteredShares.length === 0" class="text-center py-4">
                <CIcon icon="cil-folder" size="xl" class="text-muted mb-2" />
                <p class="text-muted">No shared files found</p>
              </div>

              <CRow v-if="selectedFiles.length > 0" class="mt-3">
                <CCol>
                  <CAlert color="info">
                    {{ selectedFiles.length }} file(s) selected
                    <CButton 
                      size="sm" 
                      color="danger" 
                      variant="outline"
                      class="ms-2"
                      @click="removeSelectedShares"
                    >
                      Remove Selected
                    </CButton>
                  </CAlert>
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
  name: 'Shares',
  setup() {
    const searchTerm = ref('')
    const filterType = ref('')
    const sortBy = ref('name')

    const shareStats = ref({
      totalFiles: 1247,
      totalSize: '45.2 GB',
      sharedDirs: 3,
      requests: 89
    })

    const shares = ref([
      {
        id: 1,
        name: 'Song.mp3',
        type: 'audio',
        size: '4.5 MB',
        path: 'C:\\Music\\Album\\Song.mp3',
        requests: 15,
        selected: false
      },
      {
        id: 2,
        name: 'Movie.mkv',
        type: 'video',
        size: '1.2 GB',
        path: 'C:\\Videos\\Movie.mkv',
        requests: 8,
        selected: false
      },
      {
        id: 3,
        name: 'Document.pdf',
        type: 'document',
        size: '2.1 MB',
        path: 'C:\\Documents\\Document.pdf',
        requests: 3,
        selected: false
      },
      {
        id: 4,
        name: 'Photo.jpg',
        type: 'image',
        size: '850 KB',
        path: 'C:\\Images\\Photo.jpg',
        requests: 12,
        selected: false
      },
      {
        id: 5,
        name: 'Archive.zip',
        type: 'other',
        size: '15.3 MB',
        path: 'C:\\Files\\Archive.zip',
        requests: 5,
        selected: false
      }
    ])

    const filteredShares = computed(() => {
      let filtered = shares.value

      if (searchTerm.value) {
        filtered = filtered.filter(file => 
          file.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
          file.path.toLowerCase().includes(searchTerm.value.toLowerCase())
        )
      }

      if (filterType.value) {
        filtered = filtered.filter(file => file.type === filterType.value)
      }

      // Sort files
      filtered.sort((a, b) => {
        switch (sortBy.value) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'size':
            return parseFloat(a.size) - parseFloat(b.size)
          case 'type':
            return a.type.localeCompare(b.type)
          case 'date':
            return new Date(b.date) - new Date(a.date)
          default:
            return 0
        }
      })

      return filtered
    })

    const selectedFiles = computed(() => 
      shares.value.filter(file => file.selected)
    )

    const getFileIcon = (type) => {
      switch (type) {
        case 'audio': return 'cil-music-note'
        case 'video': return 'cil-video'
        case 'document': return 'cil-description'
        case 'image': return 'cil-image'
        default: return 'cil-file'
      }
    }

    const getTypeColor = (type) => {
      switch (type) {
        case 'audio': return 'success'
        case 'video': return 'primary'
        case 'document': return 'info'
        case 'image': return 'warning'
        default: return 'secondary'
      }
    }

    const toggleSelectAll = (event) => {
      const checked = event.target.checked
      filteredShares.value.forEach(file => {
        file.selected = checked
      })
    }

    const refreshShares = () => {
      // Implement refresh logic
      console.log('Refreshing shares...')
    }

    const addShare = () => {
      // Implement add share logic
      console.log('Adding new share...')
    }

    const openFile = (file) => {
      // Implement open file logic
      console.log('Opening file:', file.name)
    }

    const removeShare = (file) => {
      if (confirm(`Remove "${file.name}" from shares?`)) {
        const index = shares.value.findIndex(s => s.id === file.id)
        if (index > -1) {
          shares.value.splice(index, 1)
        }
      }
    }

    const removeSelectedShares = () => {
      if (confirm(`Remove ${selectedFiles.value.length} selected file(s) from shares?`)) {
        shares.value = shares.value.filter(file => !file.selected)
      }
    }

    return {
      searchTerm,
      filterType,
      sortBy,
      shareStats,
      shares,
      filteredShares,
      selectedFiles,
      getFileIcon,
      getTypeColor,
      toggleSelectAll,
      refreshShares,
      addShare,
      openFile,
      removeShare,
      removeSelectedShares
    }
  }
}
</script>