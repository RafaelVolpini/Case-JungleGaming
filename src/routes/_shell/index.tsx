import { createFileRoute } from '@tanstack/react-router'

import { prefetchHome } from '@/app/prefetch'
import { HomePage } from '@/features/catalog/pages/home-page'
import { parseCatalogSearch, resolveCatalogQuery } from '@/features/catalog/search'

export const Route = createFileRoute('/_shell/')({
  validateSearch: parseCatalogSearch,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps }) => {
    prefetchHome(context.queryClient, resolveCatalogQuery(deps.search))
  },
  component: HomePage,
})
