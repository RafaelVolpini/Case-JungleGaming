import { createFileRoute } from '@tanstack/react-router'

import { HomePage } from '@/features/catalog/pages/home-page'
import { parseCatalogSearch } from '@/features/catalog/search'

export const Route = createFileRoute('/_shell/')({
  validateSearch: parseCatalogSearch,
  component: HomePage,
})
