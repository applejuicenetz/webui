<template>
  <div class="wrapper min-vh-100 d-flex flex-row align-items-center">
    <CContainer>
      <CRow class="justify-content-center">
        <CCol :md="8">
          <CCardGroup>
            <CCard class="p-4">
              <CCardBody>
                <CForm @submit.prevent="handleLogin">
                  <h1>appleJuice Login</h1>
                  <p class="text-body-secondary">Verbinden Sie sich mit Ihrem appleJuice Core</p>

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

                </CForm>
              </CCardBody>
            </CCard>
            <CCard class="text-white bg-primary py-5" style="width: 44%">
              <CCardBody class="text-center">
                <div>
                  <h2>appleJuice WebUi</h2>
                  <p class="mb-4">
                    Die moderne WebUI für Ihren appleJuice Core.
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
import UpdateModal from '@/components/UpdateModal.vue'

export default {
  name: 'Login',
  components: {
    UpdateModal
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    // Versionscheck-Variablen
    const currentAppVersion = ref(import.meta.env.VITE_APP_VERSION || 'Unbekannt')
    const latestGitHubVersion = ref(null)
    const updateAvailable = ref(false)
    const showUpdateModal = ref(false)

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

    // Funktion zum Abrufen der neuesten Version von GitHub
    const getLatestGitHubVersion = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/applejuicenetz/webui/releases/latest');
        if (!response.ok) {
          throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        }
        const data = await response.json();
        return data.tag_name; // Die Tag-Bezeichnung enthält die Versionsnummer
      } catch (error) {
        console.error('Fehler beim Abrufen der GitHub-Version:', error);
        return null;
      }
    };

    // Funktion zum Vergleichen von Versionsnummern (semantisch)
    const compareVersions = (v1, v2) => {
      // Entferne optionales 'v' Präfix
      const cleanV1 = v1.startsWith('v') ? v1.substring(1) : v1;
      const cleanV2 = v2.startsWith('v') ? v2.substring(1) : v2;

      const parts1 = cleanV1.split('.').map(Number);
      const parts2 = cleanV2.split('.').map(Number);

      for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;

        if (p1 > p2) return 1; // v1 ist neuer
        if (p1 < p2) return -1; // v2 ist neuer
      }
      return 0; // Versionen sind gleich
    };

    // Funktion zum Überprüfen auf Updates
    const checkForUpdates = async () => {
      try {
        const latestVersion = await getLatestGitHubVersion();
        if (latestVersion) {
          latestGitHubVersion.value = latestVersion;

          // Vergleiche Versionen
          if (compareVersions(latestVersion, currentAppVersion.value) > 0) {
            updateAvailable.value = true;
            console.log(`[LOGIN] Update verfügbar: ${currentAppVersion.value} -> ${latestVersion}`);

            // Prüfen, ob das Modal bereits für diese Version geschlossen wurde
            const modalDismissed = localStorage.getItem('updateModalDismissed') === 'true';
            const dismissedVersion = localStorage.getItem('updateModalDismissedVersion');

            // Wenn das Modal noch nicht geschlossen wurde oder eine neuere Version verfügbar ist
            if (!modalDismissed || dismissedVersion !== latestVersion) {
              // Zeige das Modal nach einer kurzen Verzögerung an
              setTimeout(() => {
                showUpdateModal.value = true;
              }, 1000);
            }
          } else {
            updateAvailable.value = false;
            console.log('[LOGIN] App ist auf dem neuesten Stand');
          }
        }
      } catch (err) {
        console.error('[LOGIN] Fehler beim Prüfen auf Updates:', err);
      }
    };

    // Funktion zum Schließen des Update-Modals
    const closeUpdateModal = () => {
      showUpdateModal.value = false;
    };

    const handleLogin = async () => {
      try {
        console.log('Login-Versuch mit MD5-Hash:', {
          coreUrl: loginData.value.coreUrl.trim(),
          port: loginData.value.port.trim(),
          passwordHash: '****'
        })

        const success = await authStore.login({
          coreUrl: loginData.value.coreUrl.trim(),
          port: loginData.value.port.trim(),
          password: loginData.value.password
        })

        if (success) {
          // Erfolgreiche Anmeldung - zum Dashboard weiterleiten
          console.log('Login erfolgreich!')

          // Überprüfe auf Updates nach erfolgreichem Login
          await checkForUpdates();

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
      config,
      // Versionscheck
      currentAppVersion,
      latestGitHubVersion,
      updateAvailable,
      showUpdateModal,
      closeUpdateModal
    }
  }
}
</script>
