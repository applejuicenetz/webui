import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0', // Wichtig für Docker: auf allen Interfaces hören
    port: 5173,
    hmr: false, // HMR deaktivieren für Docker-Stabilität
    watch: {
      usePolling: true // Wichtig für Docker: File watching
    },
    // Proxy deaktiviert - verwende separaten Proxy-Server auf Port 3001
    // proxy: {}
  },
  preview: {
    host: '0.0.0.0',
    port: 5173
  }
}
})
