import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'https://localhost:5000',
        secure: false, // Bypasses self-signed certificate check on development server
        changeOrigin: true,
      },
    },
  },
})
