import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const devApiTarget = (env.VITE_DEV_API_TARGET || env.VITE_API_BASE_URL || 'https://code-catalysts.vercel.app').replace(/\/$/, '')

  return {
    root: path.resolve(__dirname, 'website'),
    envDir: __dirname,
    publicDir: path.resolve(__dirname, 'assets'),
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: devApiTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
    build: {
      outDir: path.resolve(__dirname, 'dist'),
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined
            if (id.includes('framer-motion')) return 'motion'
            if (id.includes('react-router')) return 'router'
            if (id.includes('lucide-react')) return 'icons'
            if (id.includes('@supabase')) return 'supabase'
            if (id.includes('react') || id.includes('scheduler')) return 'react-vendor'
            return 'vendor'
          },
        },
      },
    },
  }
})
