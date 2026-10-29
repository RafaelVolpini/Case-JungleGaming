import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import { routePreload } from './build/plugins/route-preload.ts'

const MOCK_PACKAGES = [
  'node_modules/msw/',
  '@mswjs/',
  '@open-draft/',
  'tough-cookie',
  'rettime',
  'strict-event-emitter',
  'headers-polyfill',
  'path-to-regexp',
  'set-cookie-parser',
  'src/mocks/',
]

const REACT_PACKAGES = ['node_modules/react/', 'node_modules/react-dom/', 'node_modules/scheduler/']

const TANSTACK_PACKAGES = ['@tanstack/']

const VENDOR_PACKAGES = [
  'node_modules/axios/',
  'node_modules/zod/',
  'node_modules/tailwind-merge/',
  'node_modules/clsx/',
  'node_modules/class-variance-authority/',
  'node_modules/big.js/',
]

const matches = (id: string, parts: string[]) => parts.some((part) => id.includes(part))

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    routePreload(),
  ],
  build: {
    sourcemap: true,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react', test: (id) => matches(id, REACT_PACKAGES), priority: 50 },
            { name: 'tanstack', test: (id) => matches(id, TANSTACK_PACKAGES), priority: 45 },
            { name: 'vendor', test: (id) => matches(id, VENDOR_PACKAGES), priority: 40 },
            { name: 'mocks', test: (id) => matches(id, MOCK_PACKAGES), priority: 30 },
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      tldts: fileURLToPath(new URL('./src/mocks/shims/tldts.ts', import.meta.url)),
      'tough-cookie': fileURLToPath(new URL('./src/mocks/shims/tough-cookie.ts', import.meta.url)),
    },
  },
})
