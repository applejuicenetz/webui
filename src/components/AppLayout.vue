<template>
  <div class="app-layout d-flex flex-column min-vh-100">
    <!-- Header -->
    <AppHeader />

    <!-- Main Content -->
    <div class="container-fluid flex-grow-1">
      <div class="row">
        <!-- Sidebar -->
        <AppSidebar />

        <!-- Main Content Area -->
        <div class="col-xxl-10 col-xl-10 col-lg-9 col-md-8 ms-sm-auto px-md-4">
          <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">{{ pageTitle }}</h1>
            <div class="btn-toolbar mb-2 mb-md-0" v-if="showToolbar">
             
            </div>
          </div>

          <!-- Content Slot -->
          <slot></slot>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import AppFooter from './AppFooter.vue'

// Props
interface Props {
  title?: string
  showToolbar?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showToolbar: true
})

// Computed
const pageTitle = computed(() => {
  if (props.title) {
    return props.title
  }
  
  // Auto-generate title from route name
  const routeNames: Record<string, string> = {
    dashboard: 'Dashboard',
    dashboard2: 'Dashboard v2',
    analytics: 'Statistiken',
    users: 'Benutzerverwaltung',
    settings: 'Einstellungen'
  }
  
  // Access route through useRoute in setup
  const route = useRoute()
  return routeNames[route.name as string] || 'appleJuice WebUI'
})
</script>

<style scoped>
.app-layout {
  background-color: var(--color-body-bg);
  color: var(--color-body-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Main content area improvements */
.col-xxl-10,
.col-xl-10,
.col-lg-9,
.col-md-8 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

/* Page title styling */
.h2 {
  color: var(--color-text-primary);
  font-weight: 600;
}

.border-bottom {
  border-color: var(--color-border) !important;
}

/* Ultra-wide screen optimizations */
@media (min-width: 1400px) {
  .col-xxl-10,
  .col-xl-10 {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

@media (min-width: 1600px) {
  .col-xxl-10,
  .col-xl-10 {
    padding-left: 2.5rem;
    padding-right: 2.5rem;
  }
}

/* Enhanced responsive behavior */
@media (max-width: 992px) {
  .col-xxl-10,
  .col-xl-10,
  .col-lg-9,
  .col-md-8 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

@media (max-width: 768px) {
  .d-flex.justify-content-between.flex-wrap.flex-md-nowrap {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .btn-toolbar {
    margin-top: 1rem;
    margin-bottom: 0 !important;
  }
}

/* Enhanced button styles */
.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}
</style>