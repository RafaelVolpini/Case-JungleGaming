import { queryOptions } from '@tanstack/react-query'

import { queryKeys } from '@/lib/query/keys'

import { fetchWallets } from './wallets-api'

export function walletsQueryOptions(scope: string) {
  return queryOptions({
    queryKey: queryKeys.wallets(scope),
    queryFn: ({ signal }) => fetchWallets(signal),
    staleTime: 60_000,
  })
}
