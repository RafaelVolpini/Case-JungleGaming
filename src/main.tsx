import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { createAppRouter } from '@/app/router'
import '@/app/styles/globals.css'
import { createQueryClient } from '@/lib/query/client'

/**
 * Mocks must finish starting before any module that touches `socket.io-client`
 * is evaluated: engine.io-client captures `globalThis.WebSocket` at module
 * scope, and MSW patches that global inside `worker.start()`. Route components
 * are code-split, so they load after this resolves. See ARCHITECTURE.md.
 */
async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MOCKS === 'false') return
  const { startMockWorker } = await import('@/mocks/browser')
  const heartbeat = new URLSearchParams(window.location.search).get('heartbeat') !== '0'
  await startMockWorker({ heartbeat })
}

function render() {
  const rootElement = document.getElementById('root')
  if (!rootElement) throw new Error('Root element #root not found')

  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={createQueryClient()}>
        <RouterProvider router={createAppRouter()} />
      </QueryClientProvider>
    </StrictMode>,
  )
}

enableMocking()
  .catch((error: unknown) => {
    console.error('[bootstrap] mock layer failed to start', error)
  })
  .finally(render)
