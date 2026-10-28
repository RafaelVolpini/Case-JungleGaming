import { createFileRoute } from '@tanstack/react-router'

import { PagePlaceholder } from '@/components/feedback/page-placeholder'

export const Route = createFileRoute('/_shell/carrinho')({
  component: () => <PagePlaceholder title="Carrinho de NFTs" />,
})
