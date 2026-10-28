import { createFileRoute } from '@tanstack/react-router'

import { prefetchNftDetail } from '@/app/prefetch'
import { NftDetailPage } from '@/features/nft-detail/pages/nft-detail-page'

export const Route = createFileRoute('/_shell/nft/$slug')({
  loader: ({ context, params }) => {
    prefetchNftDetail(context.queryClient, params.slug)
  },
  component: NftDetailRoute,
})

function NftDetailRoute() {
  const { slug } = Route.useParams()
  return <NftDetailPage slug={slug} />
}
