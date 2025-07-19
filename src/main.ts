import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

// Import debug tools (nur in development)
if (import.meta.env.DEV) {
  import('./utils/xmlDebug')
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Check authentication status on app start
const authStore = useAuthStore()
authStore.checkAuthStatus()

// Start session heartbeat
authStore.startSessionHeartbeat()

app.mount('#app')
