<template>
  <div class="col-xxl-2 col-xl-2 col-lg-3 col-md-4 sidebar">
    <div class="position-sticky pt-3">
      <ul class="nav flex-column">
        <li class="nav-item">
          <router-link 
            to="/dashboard"
            class="nav-link" 
            :class="{ active: $route.name === 'dashboard' }">
            <i class="bi bi-speedometer2 me-2"></i>Dashboard
          </router-link>
        </li>
        <li class="nav-item">
          <router-link 
            to="/downloads"
            class="nav-link" 
            :class="{ active: $route.name === 'downloads' }">
            <i class="bi bi-download me-2"></i>Downloads
          </router-link>
        </li>
        <li class="nav-item">
          <router-link 
            to="/uploads"
            class="nav-link" 
            :class="{ active: $route.name === 'uploads' }">
            <i class="bi bi-upload me-2"></i>Uploads
          </router-link>
        </li>
        <li class="nav-item">
          <router-link 
            to="/search"
            class="nav-link" 
            :class="{ active: $route.name === 'search' }">
            <i class="bi bi-search me-2"></i>Suche
          </router-link>
        </li>
        <li class="nav-item">
          <router-link 
            to="/shared-folders"
            class="nav-link" 
            :class="{ active: $route.name === 'shared-folders' }">
            <i class="bi bi-folder-symlink me-2"></i>Geteilte Ordner
          </router-link>
        </li>
        <li class="nav-item">
          <router-link 
            to="/servers"
            class="nav-link" 
            :class="{ active: $route.name === 'servers' }">
            <i class="bi bi-server me-2"></i>Serverliste
          </router-link>
        </li>
        <li class="nav-item">
          <router-link 
            to="/settings"
            class="nav-link" 
            :class="{ active: $route.name === 'settings' }">
            <i class="bi bi-gear me-2"></i>Einstellungen
          </router-link>
        </li>
        <li class="nav-item">
          <router-link 
            to="/statistics"
            class="nav-link" 
            :class="{ active: $route.name === 'statistics' }">
            <i class="bi bi-bar-chart me-2"></i>Statistik
          </router-link>
        </li>
        <li class="nav-item">
          <a 
            href="https://applejuicenetz.github.io/faq/"
            target="_blank"
            class="nav-link">
            <i class="bi bi-question-circle me-2"></i>Hilfe
            <i class="bi bi-box-arrow-up-right ms-2 text-muted" style="font-size: 0.8rem;"></i>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
interface Props {
  activeTab?: string
}

defineProps<Props>()

// Events
defineEmits<{
  'tab-changed': [tab: string]
}>()
</script>

<style scoped>
.sidebar {
  min-height: calc(100vh - 56px);
  padding: 0;
  background-color: var(--color-sidebar-bg);
  border-right: 1px solid var(--color-border);
  transition: background-color 0.3s ease;
}

.nav-link {
  color: var(--color-text-secondary) !important;
  transition: all 0.3s ease;
  padding: 0.75rem 1rem;
  margin: 0.25rem 0.5rem;
  border-radius: 8px;
  text-decoration: none;
  display: block;
}

.nav-link:hover {
  color: var(--color-primary) !important;
  background-color: var(--color-surface);
  transform: translateX(4px);
}

.nav-link.active,
.router-link-active {
  color: var(--color-primary) !important;
  background-color: var(--color-primary-light);
  transform: translateX(4px);
  font-weight: 600;
}

.nav-link i {
  color: inherit;
}

/* External link styling */
.nav-link .text-muted {
  color: var(--color-text-muted) !important;
}

/* Ultra-wide screen optimizations */
@media (min-width: 1400px) {
  .sidebar .nav-link {
    padding: 1rem 1.25rem;
    font-size: 1rem;
  }
}

/* Enhanced responsive behavior */
@media (max-width: 992px) {
  .sidebar {
    min-height: auto;
    margin-bottom: 1rem;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }
  
  .col-xxl-2,
  .col-xl-2,
  .col-lg-3,
  .col-md-4 {
    margin-bottom: 1rem;
  }
}
</style>