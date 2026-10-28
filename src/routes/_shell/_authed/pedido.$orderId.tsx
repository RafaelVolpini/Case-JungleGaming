import { createFileRoute } from '@tanstack/react-router'

import { PagePlaceholder } from '@/components/feedback/page-placeholder'

export const Route = createFileRoute('/_shell/_authed/pedido/$orderId')({
  component: () => <PagePlaceholder title="Confirmação do pedido" />,
})
