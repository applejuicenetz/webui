import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  // State
  const isDark = ref(false)
  
  // Getters
  const currentTheme = computed(() => isDark.value ? 'dark' : 'light')
  const themeIcon = computed(() => isDark.value ? 'bi-sun' : 'bi-moon')
  const themeLabel = computed(() => isDark.value ? 'Hell' : 'Dunkel')
  
  // Actions
  function toggleTheme() {
    isDark.value = !isDark.value
    applyTheme()
    saveThemePreference()
  }
  
  function setTheme(theme: 'light' | 'dark') {
    isDark.value = theme === 'dark'
    applyTheme()
    saveThemePreference()
  }
  
  function applyTheme() {
    const html = document.documentElement
    if (isDark.value) {
      html.setAttribute('data-theme', 'dark')
    } else {
      html.removeAttribute('data-theme')
    }
  }
  
  function saveThemePreference() {
    localStorage.setItem('theme-preference', currentTheme.value)
  }
  
  function loadThemePreference() {
    const saved = localStorage.getItem('theme-preference')
    if (saved) {
      setTheme(saved as 'light' | 'dark')
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
  }
  
  function initTheme() {
    loadThemePreference()
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('theme-preference')) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    })
  }
  
  return {
    // State
    isDark,
    
    // Getters
    currentTheme,
    themeIcon,
    themeLabel,
    
    // Actions
    toggleTheme,
    setTheme,
    initTheme
  }
})