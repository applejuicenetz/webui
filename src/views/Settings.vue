<template>
  <div class="settings-page">
    <CContainer fluid>
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>
              <h4 class="mb-0">
                <CIcon icon="cil-settings" class="me-2" />
                Settings
              </h4>
            </CCardHeader>
            <CCardBody>
              <CTabs>
                <CTabList variant="pills">
                  <CTab>General</CTab>
                  <CTab>Network</CTab>
                  <CTab>Downloads</CTab>
                  <CTab>Uploads</CTab>
                  <CTab>Advanced</CTab>
                </CTabList>

                <CTabContent>
                  <!-- General Settings -->
                  <CTabPane>
                    <h5 class="mb-3">General Settings</h5>
                    <CForm>
                      <CRow class="mb-3">
                        <CCol :md="6">
                          <CFormLabel>Username</CFormLabel>
                          <CFormInput v-model="settings.general.username" />
                        </CCol>
                        <CCol :md="6">
                          <CFormLabel>Language</CFormLabel>
                          <CFormSelect v-model="settings.general.language">
                            <option value="en">English</option>
                            <option value="de">Deutsch</option>
                            <option value="fr">Français</option>
                          </CFormSelect>
                        </CCol>
                      </CRow>

                      <CRow class="mb-3">
                        <CCol :md="6">
                          <CFormLabel>Theme</CFormLabel>
                          <CFormSelect v-model="settings.general.theme">
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto</option>
                          </CFormSelect>
                        </CCol>
                        <CCol :md="6">
                          <CFormLabel>Default Download Path</CFormLabel>
                          <CInputGroup>
                            <CFormInput v-model="settings.general.downloadPath" readonly />
                            <CButton color="primary" variant="outline">
                              Browse
                            </CButton>
                          </CInputGroup>
                        </CCol>
                      </CRow>

                      <CFormCheck 
                        v-model="settings.general.autoStart"
                        label="Start application automatically"
                      />
                      <CFormCheck 
                        v-model="settings.general.minimizeToTray"
                        label="Minimize to system tray"
                      />
                    </CForm>
                  </CTabPane>

                  <!-- Network Settings -->
                  <CTabPane>
                    <h5 class="mb-3">Network Settings</h5>
                    <CForm>
                      <CRow class="mb-3">
                        <CCol :md="6">
                          <CFormLabel>Server Port</CFormLabel>
                          <CFormInput 
                            v-model="settings.network.port" 
                            type="number"
                            min="1024"
                            max="65535"
                          />
                        </CCol>
                        <CCol :md="6">
                          <CFormLabel>Max Connections</CFormLabel>
                          <CFormInput 
                            v-model="settings.network.maxConnections" 
                            type="number"
                            min="1"
                            max="1000"
                          />
                        </CCol>
                      </CRow>

                      <CRow class="mb-3">
                        <CCol>
                          <CFormLabel>Server List URLs (one per line)</CFormLabel>
                          <CFormTextarea 
                            v-model="settings.network.serverUrls"
                            rows="4"
                          />
                        </CCol>
                      </CRow>

                      <CFormCheck 
                        v-model="settings.network.enableUPnP"
                        label="Enable UPnP port mapping"
                      />
                      <CFormCheck 
                        v-model="settings.network.enableFirewall"
                        label="Enable firewall exception"
                      />
                    </CForm>
                  </CTabPane>

                  <!-- Download Settings -->
                  <CTabPane>
                    <h5 class="mb-3">Download Settings</h5>
                    <CForm>
                      <CRow class="mb-3">
                        <CCol :md="6">
                          <CFormLabel>Max Simultaneous Downloads</CFormLabel>
                          <CFormInput 
                            v-model="settings.downloads.maxSimultaneous" 
                            type="number"
                            min="1"
                            max="20"
                          />
                        </CCol>
                        <CCol :md="6">
                          <CFormLabel>Max Download Speed (KB/s)</CFormLabel>
                          <CFormInput 
                            v-model="settings.downloads.maxSpeed" 
                            type="number"
                            min="0"
                          />
                          <CFormText>0 = unlimited</CFormText>
                        </CCol>
                      </CRow>

                      <CRow class="mb-3">
                        <CCol :md="6">
                          <CFormLabel>Auto-retry Failed Downloads</CFormLabel>
                          <CFormSelect v-model="settings.downloads.autoRetry">
                            <option value="0">Never</option>
                            <option value="3">3 times</option>
                            <option value="5">5 times</option>
                            <option value="10">10 times</option>
                          </CFormSelect>
                        </CCol>
                        <CCol :md="6">
                          <CFormLabel>Incomplete Files Extension</CFormLabel>
                          <CFormInput v-model="settings.downloads.incompleteExt" />
                        </CCol>
                      </CRow>

                      <CFormCheck 
                        v-model="settings.downloads.autoStart"
                        label="Auto-start downloads when added"
                      />
                      <CFormCheck 
                        v-model="settings.downloads.deleteCompleted"
                        label="Delete completed downloads from list"
                      />
                    </CForm>
                  </CTabPane>

                  <!-- Upload Settings -->
                  <CTabPane>
                    <h5 class="mb-3">Upload Settings</h5>
                    <CForm>
                      <CRow class="mb-3">
                        <CCol :md="6">
                          <CFormLabel>Max Upload Speed (KB/s)</CFormLabel>
                          <CFormInput 
                            v-model="settings.uploads.maxSpeed" 
                            type="number"
                            min="0"
                          />
                          <CFormText>0 = unlimited</CFormText>
                        </CCol>
                        <CCol :md="6">
                          <CFormLabel>Max Upload Slots</CFormLabel>
                          <CFormInput 
                            v-model="settings.uploads.maxSlots" 
                            type="number"
                            min="1"
                            max="50"
                          />
                        </CCol>
                      </CRow>

                      <CRow class="mb-3">
                        <CCol>
                          <CFormLabel>Shared Directories</CFormLabel>
                          <CListGroup>
                            <CListGroupItem 
                              v-for="(dir, index) in settings.uploads.sharedDirs" 
                              :key="index"
                              class="d-flex justify-content-between align-items-center"
                            >
                              {{ dir }}
                              <CButton 
                                size="sm" 
                                color="danger" 
                                variant="ghost"
                                @click="removeSharedDir(index)"
                              >
                                <CIcon icon="cil-x" />
                              </CButton>
                            </CListGroupItem>
                          </CListGroup>
                          <CButton 
                            color="primary" 
                            variant="outline" 
                            class="mt-2"
                            @click="addSharedDir"
                          >
                            Add Directory
                          </CButton>
                        </CCol>
                      </CRow>

                      <CFormCheck 
                        v-model="settings.uploads.enableUploads"
                        label="Enable uploads"
                      />
                    </CForm>
                  </CTabPane>

                  <!-- Advanced Settings -->
                  <CTabPane>
                    <h5 class="mb-3">Advanced Settings</h5>
                    <CForm>
                      <CRow class="mb-3">
                        <CCol :md="6">
                          <CFormLabel>Log Level</CFormLabel>
                          <CFormSelect v-model="settings.advanced.logLevel">
                            <option value="error">Error</option>
                            <option value="warn">Warning</option>
                            <option value="info">Info</option>
                            <option value="debug">Debug</option>
                          </CFormSelect>
                        </CCol>
                        <CCol :md="6">
                          <CFormLabel>Connection Timeout (seconds)</CFormLabel>
                          <CFormInput 
                            v-model="settings.advanced.connectionTimeout" 
                            type="number"
                            min="5"
                            max="300"
                          />
                        </CCol>
                      </CRow>

                      <CFormCheck 
                        v-model="settings.advanced.enableDebugMode"
                        label="Enable debug mode"
                      />
                      <CFormCheck 
                        v-model="settings.advanced.enableStatistics"
                        label="Enable statistics collection"
                      />
                    </CForm>
                  </CTabPane>
                </CTabContent>
              </CTabs>

              <hr />
              <div class="text-end">
                <CButton color="secondary" class="me-2" @click="resetSettings">
                  Reset to Defaults
                </CButton>
                <CButton color="primary" @click="saveSettings">
                  Save Settings
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
import { ref } from 'vue'

export default {
  name: 'Settings',
  setup() {
    const settings = ref({
      general: {
        username: 'User123',
        language: 'en',
        theme: 'light',
        downloadPath: 'C:\\Downloads',
        autoStart: true,
        minimizeToTray: false
      },
      network: {
        port: 4661,
        maxConnections: 200,
        serverUrls: 'http://server1.applejuice.net\nhttp://server2.applejuice.net',
        enableUPnP: true,
        enableFirewall: true
      },
      downloads: {
        maxSimultaneous: 5,
        maxSpeed: 0,
        autoRetry: 3,
        incompleteExt: '.incomplete',
        autoStart: true,
        deleteCompleted: false
      },
      uploads: {
        maxSpeed: 0,
        maxSlots: 10,
        sharedDirs: [
          'C:\\Shared\\Music',
          'C:\\Shared\\Videos',
          'C:\\Shared\\Documents'
        ],
        enableUploads: true
      },
      advanced: {
        logLevel: 'info',
        connectionTimeout: 30,
        enableDebugMode: false,
        enableStatistics: true
      }
    })

    const saveSettings = () => {
      // Implement save logic
      console.log('Settings saved:', settings.value)
      alert('Settings saved successfully!')
    }

    const resetSettings = () => {
      if (confirm('Are you sure you want to reset all settings to defaults?')) {
        // Reset to default values
        console.log('Settings reset to defaults')
      }
    }

    const addSharedDir = () => {
      // Implement directory picker
      const newDir = prompt('Enter directory path:')
      if (newDir) {
        settings.value.uploads.sharedDirs.push(newDir)
      }
    }

    const removeSharedDir = (index) => {
      settings.value.uploads.sharedDirs.splice(index, 1)
    }

    return {
      settings,
      saveSettings,
      resetSettings,
      addSharedDir,
      removeSharedDir
    }
  }
}
</script>