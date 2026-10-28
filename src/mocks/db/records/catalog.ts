import type { EthAmount, Network } from '@/contracts/common'
import type { Rarity } from '@/contracts/nft'

export type EditionRecord = {
  id: string
  label: string
  index: number
  total: number
  available: number
  priceEth: EthAmount
}

export type NftRecord = {
  id: string
  slug: string
  name: string
  tokenId: string
  description: string
  collectionId: string
  network: Network
  priceEth: EthAmount
  previousPriceEth: EthAmount | null
  rarity: Rarity
  editions: EditionRecord[]
  attributes: Array<{ trait: string; value: string }>
  rating: { average: number; count: number }
  contractAddress: string
  copyright: string
  maxPerOrder: number
  listedAt: string
  favoritesCount: number
  version: number
}

export type CollectionRecord = {
  id: string
  slug: string
  name: string
}
