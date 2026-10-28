import { createFileRoute } from '@tanstack/react-router'

import { FavoritesPage } from '@/features/favorites/pages/favorites-page'
import { ProfileLayout } from '@/features/profile/components/profile-layout'

export const Route = createFileRoute('/_shell/_authed/favoritos')({
  component: FavoritesRoute,
})

function FavoritesRoute() {
  return (
    <ProfileLayout>
      <FavoritesPage />
    </ProfileLayout>
  )
}
