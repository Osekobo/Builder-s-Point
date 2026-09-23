import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Prevents duplicate copies of zustand/react from being bundled.
    // A duplicate zustand is one of the most common causes of
    // "n is not a function" in a production build.
    dedupe: ['zustand', 'react', 'react-dom'],
  },
  build: {
    // Critical: makes future prod errors point to real source lines
    // instead of minified positions like "2:499".
    sourcemap: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})