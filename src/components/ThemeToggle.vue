<template>
  <button 
    @click="themeStore.toggleTheme()" 
    class="theme-toggle"
    :title="`Zu ${themeStore.themeLabel} wechseln`"
    type="button"
  >
    <i :class="themeStore.themeIcon" class="fs-5"></i>
  </button>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease-in-out;
}

.theme-toggle:hover {
  transform: scale(1.05);
}

.theme-toggle:active {
  transform: scale(0.95);
}
</style>