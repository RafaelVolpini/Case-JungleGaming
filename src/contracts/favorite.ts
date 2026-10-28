import { z } from 'zod'

import { paginatedSchema } from './common'
import { nftSummarySchema } from './nft'

/**
 * The id list backs the heart icon everywhere in the catalog without fetching
 * full summaries; the paginated list backs the favourites screen.
 */
export const favoriteIdsSchema = z.object({
  nftIds: z.array(z.string()),
})
export type FavoriteIds = z.infer<typeof favoriteIdsSchema>

export const favoriteListResponseSchema = paginatedSchema(nftSummarySchema)
export type FavoriteListResponse = z.infer<typeof favoriteListResponseSchema>
