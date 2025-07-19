<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container-fluid">
      <a class="navbar-brand d-flex align-items-center" href="#">
        <i class="bi bi-apple me-2"></i>
        appleJuice WebUI
      </a>
      
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle d-flex align-items-center"
              href="#"
              id="navbarDropdown"
              role="button"
              data-bs-toggle="dropdown"
            >
              <i class="bi bi-person-circle me-2"></i>
              Admin
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <a class="dropdown-item" href="#">
                  <i class="bi bi-person me-2"></i>Profil
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#">
                  <i class="bi bi-gear me-2"></i>Einstellungen
                </a>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item" href="#" @click="handleLogout">
                  <i class="bi bi-box-arrow-right me-2"></i>Abmelden
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
  if (!authStore.isAuthenticated) {
    router.push('/login')
  }
}
</script>

<style scoped>
/* Enhanced navbar */
.navbar-brand {
  font-weight: 700;
  font-size: 1.25rem;
}

.bg-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}
</style>