<template>
  <div class="login-container">
    <div class="container-fluid vh-100">
      <div class="row h-100 justify-content-center">
        

        <!-- Rechte Seite mit Login-Formular -->
        <div class="col-xxl-4 col-xl-4 col-md-6 d-flex align-items-center justify-content-center px-4">
          <div class="login-form wide-login-form">
            <div class="text-center mb-4">
              <h2 class="h3 mb-3 fw-normal">Anmelden</h2>
              <p class="text-muted">Willkommen zurück! Bitte melden Sie sich an.</p>
            </div>

            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="username" class="form-label">Core-URL</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-globe"></i></span>
                  <input
                    type="text"
                    class="form-control"
                    id="core_host"
                    v-model="core_host"
                    required
                    :disabled="isLoading"
                    :placeholder="defaultCoreHost"
                  />
                  <input
                    type="text"
                    class="form-control"
                    id="core_port"
                    v-model="core_port"
                    required
                    :disabled="isLoading"
                    :placeholder="defaultCorePort"
                  />
                </div>
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">Passwort</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-lock"></i></span>
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control"
                    id="password"
                    v-model="core_password"
                    required
                    :disabled="isLoading"
                    :placeholder="defaultPasswordPlaceholder"
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="showPassword = !showPassword"
                  >
                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
              </div>

              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="rememberMe" v-model="rememberMe">
                <label class="form-check-label" for="rememberMe">
                  Angemeldet bleiben
                </label>
              </div>

              <button
                type="submit"
                class="btn btn-primary w-100 py-2"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                {{ isLoading ? 'Anmelden...' : 'Anmelden' }}
              </button>
            </form>

                        
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Umgebungsvariablen
const defaultCoreHost = import.meta.env.VITE_CORE_HOST || 'localhost'
const defaultCorePort = import.meta.env.VITE_CORE_PORT || '9851'
const defaultCorePassword = import.meta.env.VITE_DEFAULT_CORE_PASSWORD || ''
const testPassword = import.meta.env.VITE_TEST_PASSWORD || 'test'
const showTestCredentials = import.meta.env.VITE_SHOW_TEST_CREDENTIALS === 'true'
const rememberCredentials = import.meta.env.VITE_REMEMBER_CREDENTIALS === 'true'

// Reactive Variablen
const core_host = ref('')
const core_port = ref('')
const core_password = ref('')
const rememberMe = ref(rememberCredentials)
const showPassword = ref(false)
const isLoading = ref(false)

// Computed Properties für Platzhalter
const defaultPasswordPlaceholder = testPassword ? `Passwort eingeben (Test: ${testPassword})` : 'Passwort eingeben'

// Hilfsfunktionen
const fillTestCredentials = () => {
  core_host.value = 'localhost'
  core_port.value = '9851'
  core_password.value = testPassword
}

const fillDefaultCredentials = () => {
  core_host.value = defaultCoreHost.replace(/^https?:\/\//, '') // Entferne http:// oder https://
  core_port.value = defaultCorePort
  core_password.value = defaultCorePassword
}

const loadSavedCredentials = () => {
  if (rememberCredentials) {
    const savedHost = localStorage.getItem('aj_core_host')
    const savedPort = localStorage.getItem('aj_core_port')
    const savedRemember = localStorage.getItem('aj_remember_me')
    
    if (savedHost) core_host.value = savedHost
    if (savedPort) core_port.value = savedPort
    if (savedRemember === 'true') rememberMe.value = true
  }
}

const saveCredentials = () => {
  if (rememberMe.value && rememberCredentials) {
    localStorage.setItem('aj_core_host', core_host.value)
    localStorage.setItem('aj_core_port', core_port.value)
    localStorage.setItem('aj_remember_me', 'true')
  } else {
    localStorage.removeItem('aj_core_host')
    localStorage.removeItem('aj_core_port')
    localStorage.removeItem('aj_remember_me')
  }
}

const handleLogin = async () => {
  if (!core_host.value || !core_port.value || !core_password.value) {
    return
  }

  isLoading.value = true
  
  try {
    // Speichere Credentials falls gewünscht
    saveCredentials()
    
    // Kombiniere Host und Port für die URL
    const fullUrl = `${core_host.value}:${core_port.value}`
    const success = await authStore.login(fullUrl, core_password.value)
    
    if (success) {
      router.push('/dashboard')
    }
  } catch (error) {
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}

// Initialisierung
onMounted(() => {
  // Lade gespeicherte Credentials
  loadSavedCredentials()
  
  // Setze Default-Werte falls nichts gespeichert
  if (!core_host.value) {
    core_host.value = defaultCoreHost.replace(/^https?:\/\//, '')
  }
  if (!core_port.value) {
    core_port.value = defaultCorePort
  }
  if (!core_password.value && defaultCorePassword) {
    core_password.value = defaultCorePassword
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: url('@/assets/background/apple-on-grass-red.jpg') center center/cover no-repeat;
  position: relative;
}

/* Optional: Overlay für bessere Lesbarkeit */
.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.login-container > * {
  position: relative;
  z-index: 2;
}

.bg-primary {
  background: linear-gradient(135deg, #00f836 0%, #003f0b 100%) !important;
}

.login-form {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.wide-login-form {
  width: 100%;
  max-width: 800px;
}

@media (min-width: 1200px) {
  .wide-login-form {
    max-width: 1000px;
  }
}

@media (min-width: 1400px) {
  .wide-login-form {
    max-width: 1200px;
  }
}

@media (min-width: 1600px) {
  .wide-login-form {
    max-width: 1400px;
  }
}

@media (min-width: 1400px) {
  .login-form {
    padding: 3rem;
  }
}

@media (min-width: 1920px) {
  .login-form {
    padding: 4rem;
  }
}

.input-group-text {
  background-color: #f8f9fa;
  border-right: none;
}

.form-control {
  border-left: none;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.btn-primary {
  background: linear-gradient(135deg, #81ce98 0%, #036e27 100%);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 153, 39, 0.4)
}

.features h5 {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.features p {
  font-size: 0.9rem;
  opacity: 0.9;
}

.demo-credentials .card {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
}

@media (max-width: 992px) {
  .wide-login-form {
    max-width: 100% !important;
    margin: 0 1rem;
  }
}

@media (max-width: 768px) {
  .login-form {
    margin: 0.5rem;
    padding: 1.5rem !important;
  }
}
</style>