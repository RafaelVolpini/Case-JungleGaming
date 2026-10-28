import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { queryKeys } from '@/lib/query/keys'

import { fetchFavoriteIds, fetchFavorites } from './favorites-api'

export function favoriteIdsQueryOptions(scope: string) {
  return queryOptions({
    queryKey: queryKeys.favorites.ids(scope),
    queryFn: ({ signal }) => fetchFavoriteIds(signal),
    staleTime: 60_000,
  })
}

export function favoriteListQueryOptions(scope: string, page: number) {
  return queryOptions({
    queryKey: queryKeys.favorites.list(scope, page),
    queryFn: ({ signal }) => fetchFavorites(page, signal),
    placeholderData: keepPreviousData,
  })
}
