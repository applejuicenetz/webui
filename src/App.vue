<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<style>
/* Global Styles */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
}

/* Bootstrap Overrides */
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

.bg-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

/* Custom Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

/* Container improvements - maximized width */
.container-fluid {
  max-width: none;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .container-fluid {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}

@media (min-width: 992px) {
  .container-fluid {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

@media (min-width: 1200px) {
  .container-fluid {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

@media (min-width: 1400px) {
  .container-fluid {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

@media (min-width: 1600px) {
  .container-fluid {
    padding-left: 3rem;
    padding-right: 3rem;
  }
}
</style>
