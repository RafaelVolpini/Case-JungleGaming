import { createFileRoute } from '@tanstack/react-router'

import { PagePlaceholder } from '@/components/feedback/page-placeholder'

export const Route = createFileRoute('/_shell/_authed/perfil/')({
  component: () => <PagePlaceholder title="Dados do perfil" />,
})
