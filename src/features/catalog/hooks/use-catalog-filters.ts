import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'

import { DEFAULT_SORT_BY_FEED, type CatalogQuery } from '@/contracts/nft'

import {
  parseCatalogSearch,
  resolveCatalogQuery,
  stripCatalogDefaults,
  type CatalogSearch,
} from '../search'

export function useCatalogFilters() {
  const search = useSearch({ strict: false }) as CatalogSearch
  const navigate = useNavigate({ from: '/' })
  const query = useMemo(
    () => resolveCatalogQuery(parseCatalogSearch(search as Record<string, unknown>)),
    [search],
  )

  const update = useCallback(
    (patch: Partial<CatalogQuery>) => {
      const feed = patch.feed ?? query.feed
      const followsFeedDefault = query.sort === DEFAULT_SORT_BY_FEED[query.feed]
      const sort = patch.sort ?? (followsFeedDefault ? DEFAULT_SORT_BY_FEED[feed] : query.sort)
      const next: CatalogQuery = { ...query, page: 1, ...patch, sort }
      void navigate({ search: stripCatalogDefaults(next), resetScroll: false })
    },
    [navigate, query],
  )

  const reset = useCallback(() => {
    void navigate({ search: {}, resetScroll: false })
  }, [navigate])

  return { query, update, reset }
}
