import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const BACKSLASH = String.fromCharCode(92)

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

const CRITICAL_MODULES = [
  'src/app/mount.tsx',
  'src/mocks/browser.ts',
  'src/routes/_shell.tsx',
  'src/routes/_shell/index.tsx',
  'src/features/catalog/pages/home-page.tsx',
]

function preloadCriticalChunks(): Plugin {
  return {
    name: 'preload-critical-chunks',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, { bundle }) {
        if (!bundle) return
        const wanted = new Set<string>()
        const preloadedByVite = new Set<string>()

        const markStatic = (fileName: string) => {
          const chunk = bundle[fileName]
          if (!chunk || chunk.type !== 'chunk' || preloadedByVite.has(fileName)) return
          preloadedByVite.add(fileName)
          chunk.imports.forEach(markStatic)
        }

        for (const chunk of Object.values(bundle)) {
          if (chunk.type === 'chunk' && chunk.isEntry) markStatic(chunk.fileName)
        }

        const collect = (fileName: string) => {
          const chunk = bundle[fileName]
          if (!chunk || chunk.type !== 'chunk' || wanted.has(fileName)) return
          wanted.add(fileName)
          chunk.imports.forEach(collect)
        }

        for (const chunk of Object.values(bundle)) {
          if (chunk.type !== 'chunk' || chunk.isEntry) continue
          const modules = Object.keys(chunk.modules).map((id) => id.split(BACKSLASH).join('/'))
          if (modules.some((id) => CRITICAL_MODULES.some((critical) => id.includes(critical)))) {
            collect(chunk.fileName)
          }
        }

        return [...wanted]
          .filter((fileName) => !preloadedByVite.has(fileName))
          .map((fileName) => ({
            tag: 'link',
            attrs: { rel: 'modulepreload', crossorigin: '', href: `/${fileName}` },
            injectTo: 'head',
          }))
      },
    },
  }
}

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
    preloadCriticalChunks(),
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
