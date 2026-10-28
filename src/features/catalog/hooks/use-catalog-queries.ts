import { useQuery } from '@tanstack/react-query'

import type { CatalogQuery } from '@/contracts/nft'
import { useSession } from '@/features/auth/hooks/use-session'

import {
  catalogQueryOptions,
  collectionsQueryOptions,
  featuredQueryOptions,
  networksQueryOptions,
  nftDetailQueryOptions,
  relatedNftsQueryOptions,
} from '../api/catalog-queries'

export function useCatalog(query: CatalogQuery) {
  const { scope } = useSession()
  return useQuery(catalogQueryOptions(scope, query))
}

export function useNftDetail(slug: string) {
  const { scope } = useSession()
  return useQuery(nftDetailQueryOptions(scope, slug))
}

export function useCollections() {
  return useQuery(collectionsQueryOptions())
}

export function useNetworks() {
  return useQuery(networksQueryOptions())
}

export function useFeatured() {
  const { scope } = useSession()
  return useQuery(featuredQueryOptions(scope))
}

export function useRelatedNfts(slug: string) {
  const { scope } = useSession()
  return useQuery(relatedNftsQueryOptions(scope, slug))
}
