import type { QueryClient } from '@tanstack/react-query'

import type { CatalogQuery } from '@/contracts/nft'
import { cartQueryOptions } from '@/features/cart/api/cart-query'
import {
  catalogQueryOptions,
  featuredQueryOptions,
  nftDetailQueryOptions,
} from '@/features/catalog/api/catalog-queries'
import { readToken } from '@/lib/auth/token'
import { GUEST_SCOPE } from '@/lib/query/keys'

function isGuest(): boolean {
  return readToken() === null
}

export function prefetchHome(queryClient: QueryClient, query: CatalogQuery): void {
  if (!isGuest()) return
  void queryClient.prefetchQuery(featuredQueryOptions(GUEST_SCOPE))
  void queryClient.prefetchQuery(catalogQueryOptions(GUEST_SCOPE, query))
  void queryClient.prefetchQuery(cartQueryOptions(GUEST_SCOPE))
}

export function prefetchNftDetail(queryClient: QueryClient, slug: string): void {
  if (!isGuest()) return
  void queryClient.prefetchQuery(nftDetailQueryOptions(GUEST_SCOPE, slug))
  void queryClient.prefetchQuery(cartQueryOptions(GUEST_SCOPE))
}
