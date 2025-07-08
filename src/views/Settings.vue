<template>
  <div class="settings-page">
    <CContainer fluid>
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>
              <h4 class="mb-0">
                <CIcon icon="cil-settings" class="me-2" />
                Einstellungen
              </h4>
            </CCardHeader>
            <CCardBody>
              <!-- Alerts wurden durch Toast-Benachrichtigungen ersetzt -->
              
              <CRow>
                <!-- Allgemeine Einstellungen -->
                <CCol :lg="6" :md="6" :sm="12" :xs="12">
                  <CCard class="mb-4">
                    <CCardHeader>
                      Allgemeine Einstellungen
                    </CCardHeader>
                    <CCardBody>
                      <CForm @submit.prevent="saveStandardSettings">
                        <div class="mb-3">
                          <CFormLabel for="tempdir">Temporäres Verzeichnis</CFormLabel>
                          <CFormInput 
                            id="tempdir" 
                            v-model="coreSettings.tempdir"
                          />
                        </div>
                        
                        <div class="mb-3">
                          <CFormLabel for="incdir">Eingangsverzeichnis</CFormLabel>
                          <CFormInput 
                            id="incdir" 
                            v-model="coreSettings.incdir"
                          />
                        </div>
                        
                        <div class="mb-3">
                          <CFormLabel for="c_port">Port</CFormLabel>
                          <CFormInput 
                            id="c_port" 
                            v-model="coreSettings.port"
                            type="number"
                            min="1"
                            max="65535"
                          />
                        </div>
                        
                        <div class="mb-3">
                          <CFormLabel for="c_xml_port">XML Port</CFormLabel>
                          <CFormInput 
                            id="c_xml_port" 
                            v-model="coreSettings.xml_port"
                            type="number"
                            min="1"
                            max="65535"
                          />
                        </div>
                        
                        <div class="mb-3">
                          <CFormLabel for="nick">Nickname</CFormLabel>
                          <CFormInput 
                            id="nick" 
                            v-model="coreSettings.nick"
                          />
                        </div>
                        
                        <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                          <CButton color="primary" type="submit">
                            Speichern
                          </CButton>
                        </div>
                      </CForm>
                    </CCardBody>
                  </CCard>
                </CCol>
                
                <!-- Verbindungseinstellungen -->
                <CCol :lg="6" :md="6" :sm="12" :xs="12">
                  <CCard class="mb-4">
                    <CCardHeader>
                      Verbindungseinstellungen
                    </CCardHeader>
                    <CCardBody>
                      <CForm @submit.prevent="saveConnectionSettings">
                        <div class="mb-3">
                          <CFormLabel for="maxcon">Maximale Verbindungen</CFormLabel>
                          <CFormInput 
                            id="maxcon" 
                            v-model="coreSettings.maxcon"
                            type="number"
                            min="1"
                          />
                        </div>
                        
                        <div class="mb-3">
                          <CFormLabel for="maxul">Maximaler Upload (KB/s)</CFormLabel>
                          <CFormInput 
                            id="maxul" 
                            v-model="coreSettings.maxul"
                            type="number"
                            min="0"
                          />
                        </div>
                        
                        <div class="mb-3">
                          <CFormLabel for="uls">Geschwindigkeit pro Slot</CFormLabel>
                          <CFormInput 
                            id="uls" 
                            v-model="coreSettings.uls"
                            type="number"
                            min="0"
                          />
                        </div>
                        
                        <div class="mb-3">
                          <CFormLabel for="maxdl">Maximaler Download (KB/s)</CFormLabel>
                          <CFormInput 
                            id="maxdl" 
                            v-model="coreSettings.maxdl"
                            type="number"
                            min="0"
                          />
                        </div>
                        
                        <div class="mb-3">
                          <CFormLabel for="conturn">Maximale neue Verbindungen pro Durchlauf</CFormLabel>
                          <CFormInput 
                            id="conturn" 
                            v-model="coreSettings.conturn"
                            type="number"
                            min="1"
                          />
                        </div>
                        
                        <div class="mb-3">
                          <CFormLabel for="maxdlsrc">Maximale Quellen pro Datei</CFormLabel>
                          <CFormInput 
                            id="maxdlsrc" 
                            v-model="coreSettings.maxdlsrc"
                            type="number"
                            min="1"
                          />
                        </div>
                        
                        <div class="mb-3">
                          <CFormCheck 
                            id="autoconnect"
                            v-model="coreSettings.autoconnect"
                            label="Automatisch verbinden"
                          />
                        </div>
                        
                        <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                          <CButton color="primary" type="submit">
                            Speichern
                          </CButton>
                        </div>
                      </CForm>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
              
              <!-- Freigaben-Einstellungen -->
              <CRow>
                <CCol :lg="12" :md="12" :sm="12" :xs="12">
                  <CCard class="mb-4">
                    <CCardHeader>
                      Freigaben
                    </CCardHeader>
                    <CCardBody>
                      <CRow>
                        <CCol>
                          <CButton 
                            color="primary" 
                            variant="outline" 
                            class="mb-3"
                            @click="checkShares"
                          >
                            Freigaben überprüfen
                          </CButton>
                          
                          <CTable striped>
                            <CTableHead>
                              <CTableRow>
                                <CTableHeaderCell>Verzeichnis</CTableHeaderCell>
                                <CTableHeaderCell>Freigabemodus</CTableHeaderCell>
                                <CTableHeaderCell>Priorität</CTableHeaderCell>
                                <CTableHeaderCell>Aktionen</CTableHeaderCell>
                              </CTableRow>
                            </CTableHead>
                            <CTableBody>
                              <CTableRow v-for="(dir, index) in sharedDirectories" :key="index">
                                <CTableDataCell>{{ dir.name }}</CTableDataCell>
                                <CTableDataCell>
                                  <CBadge :color="dir.shareMode === 'subdirectory' ? 'success' : 'primary'">
                                    {{ dir.shareMode === 'subdirectory' ? 'Mit Unterverzeichnissen' : 'Nur Verzeichnis' }}
                                  </CBadge>
                                </CTableDataCell>
                                <CTableDataCell>{{ dir.priority }}</CTableDataCell>
                                <CTableDataCell>
                                  <CButton 
                                    size="sm" 
                                    color="danger" 
                                    variant="ghost"
                                    @click="removeShare(dir.name)"
                                    class="me-2"
                                  >
                                    <CIcon icon="cil-trash" />
                                  </CButton>
                                  <CButton 
                                    size="sm" 
                                    color="primary" 
                                    variant="ghost"
                                    @click="toggleSubdirectory(dir.name, dir.shareMode !== 'subdirectory')"
                                  >
                                    <CIcon :icon="dir.shareMode === 'subdirectory' ? 'cil-folder-open' : 'cil-folder'" />
                                  </CButton>
                                </CTableDataCell>
                              </CTableRow>
                            </CTableBody>
                          </CTable>
                          
                          <CInputGroup class="mt-3">
                            <CFormInput v-model="newShareDirectory" placeholder="Verzeichnispfad" />
                            <CFormCheck 
                              id="includeSubdirs"
                              v-model="includeSubdirectories"
                              label="Mit Unterverzeichnissen"
                              class="mx-3 d-flex align-items-center"
                            />
                            <CButton 
                              color="success" 
                              @click="addShare"
                            >
                              Verzeichnis freigeben
                            </CButton>
                          </CInputGroup>
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
import { ref, onMounted } from 'vue'
import settingsService from '../services/settingsService.js'
import shareService from '../services/shareService.js'
import toastService from '../services/toastService.js'
import { CIcon } from '@coreui/icons-vue'

export default {
  name: 'Settings',
  components: {
    CIcon
  },
  setup() {
    // Core-Einstellungen
    const coreSettings = ref({
      tempdir: '',
      incdir: '',
      port: '',
      xml_port: '',
      nick: '',
      maxcon: '',
      maxul: 0,
      uls: '',
      maxdl: 0,
      conturn: '',
      maxdlsrc: '',
      autoconnect: false
    })
    
    // Freigaben
    const sharedDirectories = ref([])
    const newShareDirectory = ref('')
    const includeSubdirectories = ref(true)
    
    // Alert-Nachrichten wurden durch Toast-Service ersetzt
    
    // Einstellungen laden
    const loadSettings = async () => {
      try {
        const settings = await settingsService.getSettings()
        coreSettings.value = settings
        await loadSharedDirectories()
      } catch (error) {
        showAlert('Fehler beim Laden der Einstellungen: ' + error.message, 'danger')
      }
    }
    
    // Freigaben laden
    const loadSharedDirectories = async () => {
      try {
        const directories = await shareService.getSharedDirectories()
        sharedDirectories.value = directories
      } catch (error) {
        showAlert('Fehler beim Laden der Freigaben: ' + error.message, 'danger')
      }
    }
    
    // Standardeinstellungen speichern
    const saveStandardSettings = async () => {
      try {
        await settingsService.saveStandardSettings(coreSettings.value)
        showAlert('Allgemeine Einstellungen erfolgreich gespeichert!', 'success')
      } catch (error) {
        showAlert('Fehler beim Speichern der Einstellungen: ' + error.message, 'danger')
      }
    }
    
    // Verbindungseinstellungen speichern
    const saveConnectionSettings = async () => {
      try {
        await settingsService.saveConnectionSettings(coreSettings.value)
        showAlert('Verbindungseinstellungen erfolgreich gespeichert!', 'success')
      } catch (error) {
        showAlert('Fehler beim Speichern der Einstellungen: ' + error.message, 'danger')
      }
    }
    
    // Freigabe hinzufügen
    const addShare = async () => {
      if (!newShareDirectory.value) {
        showAlert('Bitte geben Sie einen Verzeichnispfad ein', 'warning')
        return
      }
      
      try {
        await shareService.addShare(newShareDirectory.value, includeSubdirectories.value)
        await loadSharedDirectories()
        newShareDirectory.value = ''
        showAlert('Verzeichnis erfolgreich freigegeben!', 'success')
      } catch (error) {
        showAlert('Fehler beim Hinzufügen der Freigabe: ' + error.message, 'danger')
      }
    }
    
    // Freigabe entfernen
    const removeShare = async (directory) => {
      try {
        await shareService.removeShare(directory)
        await loadSharedDirectories()
        showAlert('Freigabe erfolgreich entfernt!', 'success')
      } catch (error) {
        showAlert('Fehler beim Entfernen der Freigabe: ' + error.message, 'danger')
      }
    }
    
    // Unterverzeichniseinstellung ändern
    const toggleSubdirectory = async (directory, includeSubdirs) => {
      try {
        await shareService.changeSubdirectory(directory, includeSubdirs)
        await loadSharedDirectories()
        showAlert('Unterverzeichniseinstellung erfolgreich geändert!', 'success')
      } catch (error) {
        showAlert('Fehler beim Ändern der Unterverzeichniseinstellung: ' + error.message, 'danger')
      }
    }
    
    // Freigaben überprüfen
    const checkShares = async () => {
      try {
        await shareService.checkShares()
        await loadSharedDirectories()
        showAlert('Freigaben erfolgreich überprüft!', 'success')
      } catch (error) {
        showAlert('Fehler beim Überprüfen der Freigaben: ' + error.message, 'danger')
      }
    }
    
    // Toast-Benachrichtigung anzeigen
    const showAlert = (message, type = 'success') => {
      switch (type) {
        case 'success':
          toastService.success(message)
          break
        case 'danger':
        case 'error':
          toastService.error(message)
          break
        case 'warning':
          toastService.warning(message)
          break
        default:
          toastService.info(message)
      }
    }
    
    // Beim Laden der Komponente Einstellungen abrufen
    onMounted(() => {
      loadSettings()
    })

    return {
      coreSettings,
      sharedDirectories,
      newShareDirectory,
      includeSubdirectories,
      saveStandardSettings,
      saveConnectionSettings,
      addShare,
      removeShare,
      toggleSubdirectory,
      checkShares
    }
  }
}
</script>