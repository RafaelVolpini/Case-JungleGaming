import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

import type { RouterContext } from '@/app/router-context'
import { RouteAnnouncer } from '@/components/layout/route-announcer'
import { Toaster } from '@/components/ui/sonner'
import { useSessionExpiry } from '@/features/auth/hooks/use-session-expiry'
import { useIdleReady } from '@/lib/use-idle-ready'
import { SimulatorHost } from '@/features/market-simulator/simulator-host'

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
  const realtimeReady = useIdleReady()
  return (
    <>
      <Outlet />
      <RouteAnnouncer />
      <SimulatorHost />
      <Toaster position="bottom-right" />
      {realtimeReady && (
        <Suspense fallback={null}>
          <RealtimeBridge />
        </Suspense>
      )}
    </>
  )
}
