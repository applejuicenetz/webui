<template>
  <div class="wrapper min-vh-100 d-flex flex-row align-items-center">
    <CContainer>
      <CRow class="justify-content-center">
        <CCol :md="8">
          <CCardGroup>
            <CCard class="p-4">
              <CCardBody>
                <CForm @submit.prevent="handleLogin">
                  <h1>AppleJuice Login</h1>
                  <p class="text-body-secondary">Verbinden Sie sich mit Ihrem AppleJuice Core</p>
                  
                  <!-- Fehlermeldung -->
                  <CAlert
                    v-if="authStore.connectionError"
                    color="danger"
                    dismissible
                    @close="authStore.connectionError = ''"
                  >
                    <strong>Verbindungsfehler:</strong> {{ authStore.connectionError }}
                  </CAlert>

                  <!-- Core URL -->
                  <CInputGroup class="mb-3">
                    <CInputGroupText>
                      <CIcon icon="cil-globe-alt" />
                    </CInputGroupText>
                    <CFormInput
                      v-model="loginData.coreUrl"
                      placeholder="Core URL (z.B. 192.168.1.100 oder localhost)"
                      autocomplete="url"
                      :disabled="authStore.isLoading"
                      required
                    />
                  </CInputGroup>

                  <!-- Port -->
                  <CInputGroup class="mb-3">
                    <CInputGroupText>
                      <CIcon icon="cil-settings" />
                    </CInputGroupText>
                    <CFormInput
                      v-model="loginData.port"
                      type="number"
                      placeholder="Port (Standard: 9851)"
                      autocomplete="off"
                      :disabled="authStore.isLoading"
                      min="1"
                      max="65535"
                      required
                    />
                  </CInputGroup>

                  <!-- Passwort -->
                  <CInputGroup class="mb-4">
                    <CInputGroupText>
                      <CIcon icon="cil-lock-locked" />
                    </CInputGroupText>
                    <CFormInput
                      v-model="loginData.password"
                      type="password"
                      placeholder="Core Passwort"
                      autocomplete="current-password"
                      :disabled="authStore.isLoading"
                      required
                    />
                  </CInputGroup>

                  <!-- Login Button -->
                  <CRow>
                    <CCol :xs="6">
                      <CButton 
                        color="primary" 
                        class="px-4" 
                        type="submit"
                        :disabled="authStore.isLoading"
                      > 
                        <CSpinner
                          v-if="authStore.isLoading"
                          size="sm"
                          class="me-2"
                        />
                        {{ authStore.isLoading ? 'Verbinde...' : 'Verbinden' }}
                      </CButton>
                    </CCol>
                    
                  </CRow>

                  <!-- Test URL Anzeige -->
                  <CRow v-if="testUrl" class="mt-3">
                    <CCol :xs="12">
                      <small class="text-muted">
                        <strong>Test-URL:</strong> {{ testUrl }}
                      </small>
                    </CCol>
                  </CRow>

                  <!-- Umgebungsvariablen Hinweis -->
                  <CRow class="mt-2">
                    <CCol :xs="12">
                      <small class="text-muted">
                        <CIcon icon="cil-info" class="me-1" />
                        Standardwerte aus .env: {{ config.core.host }}:{{ config.core.port }}
                      </small>
                    </CCol>
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
            <CCard class="text-white bg-primary py-5" style="width: 44%">
              <CCardBody class="text-center">
                <div>
                  <h2>AppleJuice neXus</h2>
                  <p class="mb-4">
                    Die moderne WebUI für Ihren AppleJuice Core. 
                    Verwalten Sie Downloads, Uploads und Shares 
                    bequem über Ihren Browser.
                  </p>
                  <div class="d-flex flex-column gap-2">
                    
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </CCardGroup>
        </CCol>
      </CRow>
    </CContainer>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { hashPassword } from '@/utils/crypto'
import { config } from '@/utils/config'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const loginData = ref({
      coreUrl: config.core.host,
      port: config.core.port,
      password: ''
    })

    // Computed für Test-URL Anzeige
    const testUrl = computed(() => {
      if (!loginData.value.coreUrl || !loginData.value.port) return ''
      return `http://${loginData.value.coreUrl}:${loginData.value.port}/settings.xml?password=[MD5-Hash]`
    })

    const handleLogin = async () => {
      try {
        console.log('Login-Versuch mit MD5-Hash:', {
          coreUrl: loginData.value.coreUrl.trim(),
          port: loginData.value.port.trim(),
          passwordHash: hashPassword(loginData.value.password)
        })
        
        const success = await authStore.login({
          coreUrl: loginData.value.coreUrl.trim(),
          port: loginData.value.port.trim(),
          password: loginData.value.password
        })

        if (success) {
          // Erfolgreiche Anmeldung - zum Dashboard weiterleiten
          console.log('Login erfolgreich!')
          router.push('/app/dashboard')
        }
      } catch (error) {
        console.error('Login-Fehler:', error)
        // Fehler wird bereits im Store gesetzt und in der UI angezeigt
      }
    }

    // Beim Laden der Komponente prüfen, ob bereits eingeloggt
    onMounted(async () => {
      if (authStore.isAuthenticated) {
        // Gespeicherte Verbindung testen
        const isValid = await authStore.testStoredConnection()
        if (isValid) {
          router.push('/app/dashboard')
        }
      }
    })

    return {
      loginData,
      authStore,
      testUrl,
      handleLogin,
      config
    }
  }
}
</script>
