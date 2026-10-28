import { createFileRoute, Outlet } from '@tanstack/react-router'

import { SiteShell } from '@/components/layout/site-shell'

export const Route = createFileRoute('/_shell')({
  component: ShellLayout,
})

function ShellLayout() {
  return (
    <SiteShell>
      <Outlet />
    </SiteShell>
  )
}
