import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'

import type { CatalogQuery } from '@/contracts/nft'

import { resolveCatalogQuery, stripCatalogDefaults, type CatalogSearch } from '../search'

export function useCatalogFilters() {
  const search = useSearch({ strict: false }) as CatalogSearch
  const navigate = useNavigate({ from: '/' })
  const query = useMemo(() => resolveCatalogQuery(search), [search])

  const update = useCallback(
    (patch: Partial<CatalogQuery>) => {
      const next: CatalogQuery = { ...query, page: 1, ...patch }
      void navigate({ search: stripCatalogDefaults(next), resetScroll: false })
    },
    [navigate, query],
  )

  const reset = useCallback(() => {
    void navigate({ search: {}, resetScroll: false })
  }, [navigate])

  return { query, update, reset }
}
