import { defineConfig } from 'vitest/config'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '')
  const useMockApi = mode === 'development' && env.VITE_USE_MOCK_API !== 'false'

  return {
    envDir: path.resolve(__dirname, '..'),
    define: {
      'import.meta.env.VITE_USE_MOCK_API': JSON.stringify(useMockApi),
    },
    plugins: [
      tailwindcss(),
    ],
    test: {
      environment: 'jsdom',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  }
})
