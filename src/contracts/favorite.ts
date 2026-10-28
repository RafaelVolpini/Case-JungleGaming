import { z } from 'zod'

import { paginatedSchema } from './common'
import { nftSummarySchema } from './nft'

export const favoriteIdsSchema = z.object({
  nftIds: z.array(z.string()),
})
export type FavoriteIds = z.infer<typeof favoriteIdsSchema>

export const favoriteListResponseSchema = paginatedSchema(nftSummarySchema)
export type FavoriteListResponse = z.infer<typeof favoriteListResponseSchema>
