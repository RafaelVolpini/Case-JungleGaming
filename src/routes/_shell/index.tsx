import { createFileRoute } from '@tanstack/react-router'

import { PagePlaceholder } from '@/components/feedback/page-placeholder'
import { parseCatalogSearch } from '@/features/catalog/search'

export const Route = createFileRoute('/_shell/')({
  validateSearch: parseCatalogSearch,
  component: () => <PagePlaceholder title="Início" />,
})
