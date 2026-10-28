import { createFileRoute, Outlet } from '@tanstack/react-router'

import { ProfileLayout } from '@/features/profile/components/profile-layout'

export const Route = createFileRoute('/_shell/_authed/perfil')({
  component: ProfileShell,
})

function ProfileShell() {
  return (
    <ProfileLayout>
      <Outlet />
    </ProfileLayout>
  )
}
