<template>
  <div class="toast-container" :class="positionClass">
    <CToast
      v-for="toast in toasts"
      :key="toast.id"
      :autohide="toast.autoHide"
      :delay="toast.delay"
      :color="toast.type"
      :class="{ 'toast-fade-in': toast.show, 'toast-fade-out': !toast.show }"
    >
      <CToastHeader :class="headerClass(toast.type)" closeButton>
        <span class="me-auto fw-bold">{{ getTitle(toast.type) }}</span>
        <small class="text-muted">{{ formatTime(toast.timestamp) }}</small>
      </CToastHeader>
      <CToastBody>
        {{ toast.message }}
      </CToastBody>
    </CToast>
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted } from 'vue'
import toastService, { TOAST_POSITIONS } from '../services/toastService'

export default {
  name: 'AppToast',
  props: {
    position: {
      type: String,
      default: TOAST_POSITIONS.TOP_RIGHT,
      validator: (value) => Object.values(TOAST_POSITIONS).includes(value)
    }
  },
  setup(props) {
    // Toast-Liste aus dem Service
    const toasts = computed(() => toastService.getToasts())

    // Position-Klasse berechnen
    const positionClass = computed(() => {
      switch (props.position) {
        case TOAST_POSITIONS.TOP_LEFT:
          return 'position-fixed top-0 start-0 p-3'
        case TOAST_POSITIONS.TOP_CENTER:
          return 'position-fixed top-0 start-50 translate-middle-x p-3'
        case TOAST_POSITIONS.TOP_RIGHT:
          return 'position-fixed top-0 end-0 p-3'
        case TOAST_POSITIONS.BOTTOM_LEFT:
          return 'position-fixed bottom-0 start-0 p-3'
        case TOAST_POSITIONS.BOTTOM_CENTER:
          return 'position-fixed bottom-0 start-50 translate-middle-x p-3'
        case TOAST_POSITIONS.BOTTOM_RIGHT:
          return 'position-fixed bottom-0 end-0 p-3'
        default:
          return 'position-fixed top-0 end-0 p-3'
      }
    })

    // Header-Klasse basierend auf Toast-Typ
    const headerClass = (type) => {
      return {
        'bg-success text-white': type === 'success',
        'bg-danger text-white': type === 'danger',
        'bg-warning': type === 'warning',
        'bg-info text-white': type === 'info'
      }
    }

    // Titel basierend auf Toast-Typ
    const getTitle = (type) => {
      switch (type) {
        case 'success':
          return 'Erfolg'
        case 'danger':
          return 'Fehler'
        case 'warning':
          return 'Warnung'
        case 'info':
          return 'Information'
        default:
          return 'Benachrichtigung'
      }
    }

    // Zeit formatieren
    const formatTime = (timestamp) => {
      if (!timestamp) return ''
      
      const date = new Date(timestamp)
      return date.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Tastatur-Shortcut zum Schließen aller Toasts (ESC)
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        toastService.clear()
      }
    }

    onMounted(() => {
      window.addEventListener('keydown', handleKeyDown)
    })

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyDown)
    })

    return {
      toasts,
      positionClass,
      headerClass,
      getTitle,
      formatTime
    }
  }
}
</script>

<style scoped>
.toast-container {
  z-index: 1090;
  max-width: 350px;
}

.toast-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

.toast-fade-out {
  animation: fadeOut 0.3s ease-in-out;
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-20px); }
}
</style>