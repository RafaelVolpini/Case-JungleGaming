import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { AppProviders } from '@/app/providers'
import { createAppRouter } from '@/app/router'
import '@/app/styles/globals.css'
import { createQueryClient } from '@/lib/query/client'

async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MOCKS === 'false') return
  const { startMockWorker } = await import('@/mocks/browser')
  const heartbeat = new URLSearchParams(window.location.search).get('heartbeat') !== '0'
  await startMockWorker({ heartbeat })
}

function render() {
  const rootElement = document.getElementById('root')
  if (!rootElement) throw new Error('Root element #root not found')

  const queryClient = createQueryClient()
  const router = createAppRouter(queryClient)

  createRoot(rootElement).render(
    <StrictMode>
      <AppProviders queryClient={queryClient}>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  )
}

enableMocking()
  .catch((error: unknown) => {
    console.error('[bootstrap] mock layer failed to start', error)
  })
  .finally(render)
