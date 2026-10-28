import {
  favoriteIdsSchema,
  favoriteListResponseSchema,
  type FavoriteIds,
  type FavoriteListResponse,
} from '@/contracts/favorite'
import { http } from '@/lib/http/client'

export async function fetchFavoriteIds(signal?: AbortSignal): Promise<FavoriteIds> {
  const { data } = await http.get('/favorites/ids', { signal })
  return favoriteIdsSchema.parse(data)
}

export async function fetchFavorites(
  page: number,
  signal?: AbortSignal,
): Promise<FavoriteListResponse> {
  const { data } = await http.get('/favorites', { params: { page }, signal })
  return favoriteListResponseSchema.parse(data)
}

export async function addFavorite(nftId: string): Promise<void> {
  await http.put(`/favorites/${nftId}`)
}

export async function removeFavorite(nftId: string): Promise<void> {
  await http.delete(`/favorites/${nftId}`)
}
