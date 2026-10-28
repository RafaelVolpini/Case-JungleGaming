import { createFileRoute } from '@tanstack/react-router'

import { WalletsPage } from '@/features/wallets/pages/wallets-page'

export const Route = createFileRoute('/_shell/_authed/perfil/carteiras')({
  component: WalletsPage,
})
