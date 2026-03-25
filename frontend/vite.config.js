import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['.ngrok-free.dev'],
    proxy: {
      '/login': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path
      },
      '/register': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/challenges': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/notifications': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
