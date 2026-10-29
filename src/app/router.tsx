import type { QueryClient } from '@tanstack/react-query'
import { createRouter, parseSearchWith, stringifySearchWith } from '@tanstack/react-router'

import { NotFoundScreen } from '@/components/feedback/not-found-screen'
import { RouteErrorScreen } from '@/components/feedback/route-error-screen'
import { routeTree } from '@/routeTree.gen'

export function createAppRouter(queryClient: QueryClient) {
  return createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    scrollRestoration: true,
    scrollToTopSelectors: ['[data-modal-overlay]'],
    parseSearch: parseSearchWith((value) => value),
    stringifySearch: stringifySearchWith((value) => String(value)),
    defaultNotFoundComponent: NotFoundScreen,
    defaultErrorComponent: RouteErrorScreen,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
