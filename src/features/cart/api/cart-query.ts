import { queryOptions } from '@tanstack/react-query'

import { queryKeys } from '@/lib/query/keys'

import { fetchCart } from './cart-api'

export function cartQueryOptions(scope: string) {
  return queryOptions({
    queryKey: queryKeys.cart(scope),
    queryFn: ({ signal }) => fetchCart(signal),
    staleTime: 10_000,
  })
}
