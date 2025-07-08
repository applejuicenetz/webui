/**
 * Toast-Benachrichtigungsservice
 * Bietet eine zentrale Verwaltung für Toast-Benachrichtigungen im gesamten Projekt
 */

import { ref, reactive } from 'vue'

// Toast-Typen
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'danger',
  WARNING: 'warning',
  INFO: 'info'
}

// Toast-Positionen
export const TOAST_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  TOP_CENTER: 'top-center',
  BOTTOM_CENTER: 'bottom-center'
}

// Toast-Konfiguration
const defaultConfig = {
  position: TOAST_POSITIONS.TOP_RIGHT,
  autoHide: true,
  delay: 5000
}

// Toast-Liste
const toasts = reactive([])

// Eindeutige ID für Toasts
let nextId = 1

/**
 * Toast-Service
 */
class ToastService {
  /**
   * Toast hinzufügen
   * @param {string} message - Nachrichtentext
   * @param {string} type - Toast-Typ (success, danger, warning, info)
   * @param {Object} options - Zusätzliche Optionen
   * @returns {number} - Toast-ID
   */
  add(message, type = TOAST_TYPES.INFO, options = {}) {
    const id = nextId++
    const toast = {
      id,
      message,
      type,
      ...defaultConfig,
      ...options,
      show: true,
      timestamp: new Date()
    }

    toasts.push(toast)

    // Automatisches Ausblenden
    if (toast.autoHide) {
      setTimeout(() => {
        this.remove(id)
      }, toast.delay)
    }

    return id
  }

  /**
   * Erfolgs-Toast anzeigen
   * @param {string} message - Nachrichtentext
   * @param {Object} options - Zusätzliche Optionen
   * @returns {number} - Toast-ID
   */
  success(message, options = {}) {
    return this.add(message, TOAST_TYPES.SUCCESS, options)
  }

  /**
   * Fehler-Toast anzeigen
   * @param {string} message - Nachrichtentext
   * @param {Object} options - Zusätzliche Optionen
   * @returns {number} - Toast-ID
   */
  error(message, options = {}) {
    return this.add(message, TOAST_TYPES.ERROR, options)
  }

  /**
   * Warnungs-Toast anzeigen
   * @param {string} message - Nachrichtentext
   * @param {Object} options - Zusätzliche Optionen
   * @returns {number} - Toast-ID
   */
  warning(message, options = {}) {
    return this.add(message, TOAST_TYPES.WARNING, options)
  }

  /**
   * Info-Toast anzeigen
   * @param {string} message - Nachrichtentext
   * @param {Object} options - Zusätzliche Optionen
   * @returns {number} - Toast-ID
   */
  info(message, options = {}) {
    return this.add(message, TOAST_TYPES.INFO, options)
  }

  /**
   * Toast entfernen
   * @param {number} id - Toast-ID
   */
  remove(id) {
    const index = toasts.findIndex(toast => toast.id === id)
    if (index !== -1) {
      // Ausblend-Animation starten
      toasts[index].show = false
      
      // Nach kurzer Verzögerung aus Array entfernen
      setTimeout(() => {
        const currentIndex = toasts.findIndex(toast => toast.id === id)
        if (currentIndex !== -1) {
          toasts.splice(currentIndex, 1)
        }
      }, 300) // Kurze Verzögerung für Animation
    }
  }

  /**
   * Alle Toasts entfernen
   */
  clear() {
    toasts.splice(0, toasts.length)
  }

  /**
   * Alle Toasts abrufen
   * @returns {Array} - Toast-Liste
   */
  getToasts() {
    return toasts
  }
}

// Singleton-Instanz
const toastService = new ToastService()
export default toastService