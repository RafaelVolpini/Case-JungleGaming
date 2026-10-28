import { z } from 'zod'

import {
  ethAmountSchema,
  networkSchema,
  paginatedSchema,
  timestampSchema,
  versionSchema,
} from './common'

export const collectionSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  nftCount: z.number().int().nonnegative(),
})
export type Collection = z.infer<typeof collectionSchema>

export const raritySchema = z.enum(['common', 'rare', 'legendary'])
export type Rarity = z.infer<typeof raritySchema>

export const nftImageSchema = z.object({
  url: z.string(),
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
})

export const editionSchema = z.object({
  id: z.string(),
  label: z.string(),
  index: z.number().int().positive(),
  total: z.number().int().positive(),
  available: z.number().int().nonnegative(),
  priceEth: ethAmountSchema,
})
export type Edition = z.infer<typeof editionSchema>

export const nftAttributeSchema = z.object({
  trait: z.string(),
  value: z.string(),
})

export const nftSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  tokenId: z.string(),
  image: nftImageSchema,
  priceEth: ethAmountSchema,
  previousPriceEth: ethAmountSchema.nullable(),
  rarity: raritySchema,
  network: networkSchema,
  collection: collectionSchema.pick({ id: true, slug: true, name: true }),
  available: z.number().int().nonnegative(),
  isFavorite: z.boolean(),
  listedAt: timestampSchema,
  version: versionSchema,
})
export type NftSummary = z.infer<typeof nftSummarySchema>

export const nftDetailSchema = nftSummarySchema.extend({
  description: z.string(),
  images: z.array(nftImageSchema).min(1),
  editions: z.array(editionSchema).min(1),
  attributes: z.array(nftAttributeSchema),
  rating: z.object({
    average: z.number().min(0).max(5),
    count: z.number().int().nonnegative(),
  }),
  contractAddress: z.string(),
  copyright: z.string(),
  maxPerOrder: z.number().int().positive(),
})
export type NftDetail = z.infer<typeof nftDetailSchema>

export const nftListResponseSchema = paginatedSchema(nftSummarySchema)
export type NftListResponse = z.infer<typeof nftListResponseSchema>

export const feedSchema = z.enum(['all', 'new', 'trending'])
export type Feed = z.infer<typeof feedSchema>

export const sortSchema = z.enum(['recent', 'price-asc', 'price-desc', 'popular'])
export type Sort = z.infer<typeof sortSchema>

export const SORT_LABELS: Record<Sort, string> = {
  recent: 'Listados recentemente',
  'price-asc': 'Menor preço',
  'price-desc': 'Maior preço',
  popular: 'Mais populares',
}

export const CATALOG_PER_PAGE = 9

export const catalogQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  collections: z.array(z.string()).default([]),
  networks: z.array(networkSchema).default([]),
  rarity: z.array(raritySchema).default([]),
  minPriceEth: ethAmountSchema.optional(),
  maxPriceEth: ethAmountSchema.optional(),
  feed: feedSchema.default('all'),
  sort: sortSchema.default('recent'),
  page: z.number().int().positive().default(1),
})

export type CatalogQuery = z.infer<typeof catalogQuerySchema>
export type CatalogQueryInput = z.input<typeof catalogQuerySchema>
