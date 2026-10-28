import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

import type { RouterContext } from '@/app/router-context'
import { Toaster } from '@/components/ui/sonner'
import { useSessionExpiry } from '@/features/auth/hooks/use-session-expiry'

const RealtimeBridge = lazy(() =>
  import('@/features/realtime/realtime-bridge').then((module) => ({
    default: module.RealtimeBridge,
  })),
)

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  useSessionExpiry()
  return (
    <>
      <Outlet />
      <Toaster position="bottom-right" />
      <Suspense fallback={null}>
        <RealtimeBridge />
      </Suspense>
    </>
  )
}
