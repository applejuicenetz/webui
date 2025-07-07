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
                    <CIcon :icon="cilFolderOpen" class="me-2" />
                    Freigegebene Verzeichnisse
                  </h4>
                </CCol>
                <CCol class="text-end">
                  <CButton color="primary" @click="checkShares" :disabled="isLoading">
                    <CSpinner v-if="isLoading" size="sm" class="me-1" />
                    <CIcon v-else :icon="cilReload" class="me-1" />
                    {{ $t('Share.check') }}
                  </CButton>
                </CCol>
              </CRow>
            </CCardHeader>
            <CCardBody>
              <div v-if="alert.show" class="mb-3">
                <CAlert :color="alert.type" dismissible @close="alert.show = false">
                  <strong>{{ alert.title }}</strong> {{ alert.message }}
                </CAlert>
              </div>
              
              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell width="1"></CTableHeaderCell>
                    <CTableHeaderCell width="70%">{{ $t('Share.directory_name') }}</CTableHeaderCell>
                    <CTableHeaderCell>{{ $t('Share.subs') }}</CTableHeaderCell>
                    <CTableHeaderCell width="10">{{ $t('Share.aktion') }}</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  <!-- Temp-Verzeichnis -->
                  <CTableRow>
                    <CTableDataCell width="1">
                      <CIcon :icon="cilFolder" />
                    </CTableDataCell>
                    <CTableDataCell colspan="3">
                      <a :href="`index.php?site=sharefiles&dir=${encodeURIComponent(tempDirectory)}`">
                        {{ tempDirectory }}
                      </a>
                    </CTableDataCell>
                  </CTableRow>
                  
                  <!-- Freigegebene Verzeichnisse -->
                  <CTableRow v-for="(dir, index) in sharedDirectories" :key="index">
                    <CTableDataCell width="1">
                      <CIcon :icon="cilFolder" />
                    </CTableDataCell>
                    <CTableDataCell>
                      <a :href="`index.php?site=sharefiles&dir=${encodeURIComponent(dir.name)}`">
                        {{ dir.name }}
                      </a>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CFormCheck 
                        :checked="dir.shareMode === 'subdirectory'" 
                        @change="changeSubdirectory(dir)"
                        :disabled="isLoading"
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton 
                        size="sm" 
                        color="danger" 
                        @click="removeShare(dir)"
                        :disabled="isLoading"
                      >
                        <CIcon :icon="cilTrash" />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                  
                  <!-- Neues Verzeichnis hinzufügen -->
                  <CTableRow>
                    <CTableDataCell colspan="4">
                      {{ $t('Share.shared_directories_new') }}
                    </CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableDataCell></CTableDataCell>
                    <CTableDataCell>
                      <CFormInput 
                        v-model="newShare.path" 
                        class="form-control input-sm" 
                        :placeholder="$t('Share.way')"
                        :disabled="isLoading"
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <CFormCheck v-model="newShare.includeSubs" :disabled="isLoading" />
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton 
                        size="sm" 
                        color="primary" 
                        @click="addNewShare"
                        :disabled="isLoading || !newShare.path"
                      >
                        <CSpinner v-if="isLoading" size="sm" />
                        <CIcon v-else :icon="cilSave" />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCoreStore } from '../stores/core.js'
import { useAuthStore } from '../stores/auth.js'
import shareService from '../services/shareService.js'
import { 
  CContainer, CRow, CCol, CCard, CCardHeader, CCardBody, 
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, CFormCheck, CFormInput, CAlert, CSpinner
} from '@coreui/vue'
import { CIcon } from '@coreui/icons-vue'
import { 
  cilFolderOpen, cilReload, cilFolder, cilTrash, cilSave
} from '@coreui/icons'

// Stores
const coreStore = useCoreStore()
const authStore = useAuthStore()

// Reaktive Daten
const sharedDirectories = ref([])
const tempDirectory = ref('/temp')
const isLoading = ref(false)
const alert = ref({
  show: false,
  type: 'info',
  title: '',
  message: ''
})

// Neues Share
const newShare = ref({
  path: '',
  includeSubs: true
})

// Übersetzungen (Platzhalter - in einer echten Implementierung würde hier ein i18n-System verwendet)
const $t = (key) => {
  const translations = {
    'Share.check': 'Überprüfen',
    'Share.directory_name': 'Verzeichnisname',
    'Share.subs': 'Unterverzeichnisse',
    'Share.aktion': 'Aktion',
    'Share.shared_directories_new': 'Neues Verzeichnis freigeben',
    'Share.way': 'Pfad',
    'Share.in_progress': 'In Bearbeitung',
    'Share.set_share': 'Freigabeeinstellungen werden aktualisiert',
    'Share.new_share': 'Verzeichnis wird freigegeben',
    'Share.confirm_delete': 'Möchten Sie dieses Verzeichnis wirklich aus der Freigabe entfernen?'
  }
  return translations[key] || key
}

// Beim Laden der Komponente
onMounted(async () => {
  await loadSharedDirectories()
})

// Freigegebene Verzeichnisse laden
const loadSharedDirectories = async () => {
  try {
    isLoading.value = true
    
    // Verzeichnisse vom ShareService laden
    const directories = await shareService.getSharedDirectories()
    sharedDirectories.value = directories
    
    // Temp-Verzeichnis laden
    tempDirectory.value = await shareService.getTempDirectory()
    
    console.log('Freigegebene Verzeichnisse geladen:', directories)
    console.log('Temp-Verzeichnis:', tempDirectory.value)
    
  } catch (error) {
    console.error('Fehler beim Laden der freigegebenen Verzeichnisse:', error)
    showAlert('danger', 'Fehler:', error.message)
    
    // Fallback: Beispieldaten verwenden
    sharedDirectories.value = [
      { 
        name: 'C:\\Musik', 
        shareMode: 'subdirectory' 
      },
      { 
        name: 'C:\\Filme', 
        shareMode: 'directory' 
      },
      { 
        name: 'C:\\Dokumente', 
        shareMode: 'subdirectory' 
      }
    ]
    tempDirectory.value = 'C:\\AppleJuice\\Temp'
  } finally {
    isLoading.value = false
  }
}

// Unterverzeichnisse ein-/ausschalten
const changeSubdirectory = async (directory) => {
  try {
    isLoading.value = true
    
    const newMode = directory.shareMode === 'subdirectory' ? 'directory' : 'subdirectory'
    const includeSubdirectories = newMode === 'subdirectory'
    
    // ShareService verwenden
    await shareService.changeSubdirectory(directory.name, includeSubdirectories)
    
    // Lokale Daten aktualisieren
    directory.shareMode = newMode
    
    showAlert('info', $t('Share.in_progress'), $t('Share.set_share'))
  } catch (error) {
    console.error('Fehler beim Ändern der Unterverzeichniseinstellungen:', error)
    showAlert('danger', 'Fehler:', error.message)
  } finally {
    isLoading.value = false
  }
}

// Verzeichnis aus der Freigabe entfernen
const removeShare = async (directory) => {
  // Bestätigungsdialog anzeigen
  const confirmMessage = $t('Share.confirm_delete')
  const isConfirmed = window.confirm(confirmMessage)
  
  if (isConfirmed) {
    try {
      isLoading.value = true
      
      // ShareService verwenden
      await shareService.removeShare(directory.name)
      
      // Lokale Daten aktualisieren
      const index = sharedDirectories.value.findIndex(d => d.name === directory.name)
      if (index !== -1) {
        sharedDirectories.value.splice(index, 1)
      }
      
      showAlert('success', 'Erfolg:', 'Verzeichnis wurde aus der Freigabe entfernt')
    } catch (error) {
      console.error('Fehler beim Entfernen des Verzeichnisses:', error)
      showAlert('danger', 'Fehler:', error.message)
    } finally {
      isLoading.value = false
    }
  }
}

// Neues Verzeichnis freigeben
const addNewShare = async () => {
  if (!newShare.value.path) {
    showAlert('warning', 'Warnung:', 'Bitte geben Sie einen Pfad an')
    return
  }
  
  try {
    isLoading.value = true
    
    // ShareService verwenden
    await shareService.addShare(newShare.value.path, newShare.value.includeSubs)
    
    // Lokale Daten aktualisieren
    sharedDirectories.value.push({
      name: newShare.value.path,
      shareMode: newShare.value.includeSubs ? 'subdirectory' : 'directory'
    })
    
    // Formular zurücksetzen
    newShare.value.path = ''
    
    showAlert('info', $t('Share.in_progress'), $t('Share.new_share'))
  } catch (error) {
    console.error('Fehler beim Hinzufügen des Verzeichnisses:', error)
    showAlert('danger', 'Fehler:', error.message)
  } finally {
    isLoading.value = false
  }
}

// Shares überprüfen
const checkShares = async () => {
  try {
    isLoading.value = true
    
    // ShareService verwenden
    await shareService.checkShares()
    
    showAlert('info', 'Information:', 'Überprüfung der Freigaben wurde gestartet')
    
    // Nach einer kurzen Verzögerung die Verzeichnisse neu laden
    setTimeout(async () => {
      await loadSharedDirectories()
    }, 1000)
    
  } catch (error) {
    console.error('Fehler beim Überprüfen der Freigaben:', error)
    showAlert('danger', 'Fehler:', error.message)
  } finally {
    isLoading.value = false
  }
}

// Alert anzeigen
const showAlert = (type, title, message) => {
  alert.value = {
    show: true,
    type,
    title,
    message
  }
  
  // Alert nach 5 Sekunden automatisch ausblenden
  setTimeout(() => {
    alert.value.show = false
  }, 5000)
}
</script>