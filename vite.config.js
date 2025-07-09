import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Package.json lesen, um die Version zu extrahieren
const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, 'package.json'), 'utf8')
)

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
    // App-Version aus package.json injizieren
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version)
  },
  server: {
    host: '0.0.0.0', // Wichtig für Docker: auf allen Interfaces hören
    port: 5173,
    hmr: false, // HMR deaktivieren für Docker-Stabilität
    watch: {
      usePolling: true // Wichtig für Docker: File watching
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173
  }
}
})
