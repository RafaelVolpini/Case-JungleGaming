import { createFileRoute } from '@tanstack/react-router'

import { PagePlaceholder } from '@/components/feedback/page-placeholder'

export const Route = createFileRoute('/_shell/nft/$slug')({
  component: () => <PagePlaceholder title="Detalhe do NFT" />,
})
