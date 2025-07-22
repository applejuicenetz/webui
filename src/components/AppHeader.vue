<template>
  <nav class="navbar navbar-expand-lg navbar-dark app-header">
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
          <li class="nav-item me-2">
            <ThemeToggle />
          </li>
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
import ThemeToggle from './ThemeToggle.vue'

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

.app-header {
  background-color: var(--color-header-bg);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--box-shadow);
}

.app-header .navbar-brand {
  color: var(--color-primary) !important;
}

.app-header .nav-link {
  color: var(--color-text-primary) !important;
}

.app-header .nav-link:hover {
  color: var(--color-primary) !important;
}

.app-header .dropdown-menu {
  background-color: var(--color-card-bg);
  border-color: var(--color-border);
  box-shadow: var(--box-shadow-lg);
}

.app-header .dropdown-item {
  color: var(--color-text-primary);
}

.app-header .dropdown-item:hover {
  background-color: var(--color-surface);
  color: var(--color-primary);
}

.app-header .navbar-toggler {
  border-color: var(--color-border);
}

.app-header .navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%2868, 71, 106, 0.75%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='m4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
}

[data-theme="dark"] .app-header .navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28200, 211, 240, 0.75%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='m4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
}
</style>