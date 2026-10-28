import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { PagePlaceholder } from '@/components/feedback/page-placeholder'

const authSearchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/_shell/criar-conta')({
  validateSearch: authSearchSchema,
  component: () => <PagePlaceholder title="Criar conta" />,
})
