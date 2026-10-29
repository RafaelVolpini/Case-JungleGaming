import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

import type { RouterContext } from '@/app/router-context'
import { RouteAnnouncer } from '@/components/layout/route-announcer'
import { useSessionExpiry } from '@/features/auth/hooks/use-session-expiry'
import { useIdleReady } from '@/lib/use-idle-ready'
import { useToasterRequested } from '@/lib/toaster-gate'
import { SimulatorHost } from '@/features/market-simulator/simulator-host'

const LazyToaster = lazy(() => import('@/components/ui/lazy-toaster'))
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
  const toasterRequested = useToasterRequested()
  return (
    <>
      <Outlet />
      <RouteAnnouncer />
      <SimulatorHost />
      {(toasterRequested || realtimeReady) && (
        <Suspense fallback={null}>
          <LazyToaster />
        </Suspense>
      )}
      {realtimeReady && (
        <Suspense fallback={null}>
          <RealtimeBridge />
        </Suspense>
      )}
    </>
  )
}
