import type { EthAmount, Network } from '@/contracts/common'
import type { Rarity } from '@/contracts/nft'

import type { ArtId } from '@/lib/format/image'

export type NftArt = ArtId

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
  art: NftArt
  series: string
  collectionId: string
  network: Network
  priceEth: EthAmount
  previousPriceEth: EthAmount | null
  rarity: Rarity
  editions: EditionRecord[]
  attributes: Array<{ trait: string; value: string }>
  rating: { average: number; count: number }
  contractAddress: string
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
