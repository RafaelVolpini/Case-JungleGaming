import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

import type { RouterContext } from '@/app/router-context'
import { Toaster } from '@/components/ui/sonner'
import { useSessionExpiry } from '@/features/auth/hooks/use-session-expiry'

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  useSessionExpiry()
  return (
    <>
      <Outlet />
      <Toaster position="bottom-right" />
    </>
  )
}
