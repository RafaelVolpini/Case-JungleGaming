import type { Network } from '@/contracts/common'
import type { Rarity } from '@/contracts/nft'

/**
 * Plain shape of the generated seed data. Amounts are plain strings here and
 * get validated into `EthAmount` when the mock database is built, so a bad
 * fixture fails at seed time rather than somewhere deep in the UI.
 */
export type NftSeed = {
  id: string
  slug: string
  name: string
  tokenId: string
  description: string
  collectionId: string
  network: Network
  priceEth: string
  previousPriceEth: string | null
  rarity: Rarity
  editions: Array<{
    id: string
    label: string
    index: number
    total: number
    available: number
    priceEth: string
  }>
  attributes: Array<{ trait: string; value: string }>
  rating: { average: number; count: number }
  contractAddress: string
  copyright: string
  maxPerOrder: number
  listedAt: string
  favoritesCount: number
}
