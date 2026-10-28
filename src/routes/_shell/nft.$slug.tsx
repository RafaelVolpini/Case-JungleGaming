import { createFileRoute } from '@tanstack/react-router'

import { NftDetailPage } from '@/features/nft-detail/pages/nft-detail-page'

export const Route = createFileRoute('/_shell/nft/$slug')({
  component: NftDetailRoute,
})

function NftDetailRoute() {
  const { slug } = Route.useParams()
  return <NftDetailPage slug={slug} />
}
