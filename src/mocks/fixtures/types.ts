import type { Network } from '@/contracts/common'
import type { NftArt } from '../db/records/catalog'
import type { Rarity } from '@/contracts/nft'

export type NftSeed = {
  id: string
  slug: string
  name: string
  tokenId: string
  art: NftArt
  series: string
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
  maxPerOrder: number
  listedAt: string
  favoritesCount: number
}
