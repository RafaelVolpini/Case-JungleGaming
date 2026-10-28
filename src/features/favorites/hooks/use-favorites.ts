import { useQuery } from '@tanstack/react-query'

import { useSession } from '@/features/auth/hooks/use-session'

import { favoriteIdsQueryOptions, favoriteListQueryOptions } from '../api/favorites-queries'

export function useFavoriteIds() {
  const { scope, isAuthenticated } = useSession()
  return useQuery({ ...favoriteIdsQueryOptions(scope), enabled: isAuthenticated })
}

export function useIsFavorite(nftId: string, fallback = false): boolean {
  const { data } = useFavoriteIds()
  return data ? data.nftIds.includes(nftId) : fallback
}

export function useFavoriteList(page: number) {
  const { scope, isAuthenticated } = useSession()
  return useQuery({ ...favoriteListQueryOptions(scope, page), enabled: isAuthenticated })
}
