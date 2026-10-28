import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import type { CatalogQuery } from '@/contracts/nft'
import { queryKeys } from '@/lib/query/keys'

import {
  fetchCatalog,
  fetchCollections,
  fetchFeatured,
  fetchNetworks,
  fetchNftDetail,
} from './catalog-api'

const FACET_STALE_MS = 5 * 60_000

export function catalogQueryOptions(scope: string, query: CatalogQuery) {
  return queryOptions({
    queryKey: queryKeys.catalog.list(scope, query),
    queryFn: ({ signal }) => fetchCatalog(query, signal),
    placeholderData: keepPreviousData,
  })
}

export function nftDetailQueryOptions(scope: string, slug: string) {
  return queryOptions({
    queryKey: queryKeys.catalog.detail(scope, slug),
    queryFn: ({ signal }) => fetchNftDetail(slug, signal),
    retry: (count, error) => (error as { status?: number }).status !== 404 && count < 2,
  })
}

export function collectionsQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.catalog.collections,
    queryFn: ({ signal }) => fetchCollections(signal),
    staleTime: FACET_STALE_MS,
  })
}

export function networksQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.catalog.networks,
    queryFn: ({ signal }) => fetchNetworks(signal),
    staleTime: FACET_STALE_MS,
  })
}

export function featuredQueryOptions(scope: string) {
  return queryOptions({
    queryKey: queryKeys.catalog.featured(scope),
    queryFn: ({ signal }) => fetchFeatured(signal),
    staleTime: FACET_STALE_MS,
  })
}
