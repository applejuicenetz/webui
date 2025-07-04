import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import autoprefixer from 'autoprefixer'

export default defineConfig(() => {
  return {
    plugins: [vue()],
    base: './',
    css: {
      postcss: {
        plugins: [
          autoprefixer({}), // add options if needed
        ],
      },
    },
    resolve: {
      alias: [
        // webpack path resolve to vitejs
        {
          find: /^~(.*)$/,
          replacement: '$1',
        },
        {
          find: '@/',
          replacement: `${path.resolve(__dirname, 'src')}/`,
        },
        {
          find: '@',
          replacement: path.resolve(__dirname, '/src'),
        },
      ],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.scss'],
    },
    server: {
      port: 3000,
      host: '0.0.0.0', // Wichtig für Docker
      cors: true,
      hmr: {
        host: 'localhost', // HMR für lokale Entwicklung
        port: 3000,
      },
      watch: {
        usePolling: true, // Für Docker file watching
        interval: 100,
      },
      proxy: {
        // Proxy AppleJuice Core API requests to avoid CORS issues
        '/api': {
          target: `http://${process.env.VITE_AJ_CORE_HOST || '192.168.178.222'}:${process.env.VITE_AJ_CORE_PORT || '9854'}`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
              // Allow dynamic target based on headers
              const targetHost = req.headers['x-target-host'];
              const targetPort = req.headers['x-target-port'];
              if (targetHost && targetPort) {
                options.target = `http://${targetHost}:${targetPort}`;
              }
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          }
        }
      },
    },
  }
})
