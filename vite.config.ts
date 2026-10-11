import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined
          if (/[\\/](three|@react-three|postprocessing|maath|stats-gl)[\\/]/.test(id)) return 'three'
          if (/[\\/](gsap|@gsap|lenis|motion|framer-motion)[\\/]/.test(id)) return 'motion'
          return undefined
        },
      },
    },
  },
})
