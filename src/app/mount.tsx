import { RouterProvider } from '@tanstack/react-router'
import { StrictMode, startTransition } from 'react'
import { createRoot } from 'react-dom/client'

import { AppProviders } from '@/app/providers'
import { createAppRouter } from '@/app/router'
import { createQueryClient } from '@/lib/query/client'

export function mountApp(): void {
  const rootElement = document.getElementById('root')
  if (!rootElement) throw new Error('Root element #root not found')

  const queryClient = createQueryClient()
  const router = createAppRouter(queryClient)
  void router.load()

  startTransition(() => {
    createRoot(rootElement).render(
      <StrictMode>
        <AppProviders queryClient={queryClient}>
          <RouterProvider router={router} />
        </AppProviders>
      </StrictMode>,
    )
  })
}
