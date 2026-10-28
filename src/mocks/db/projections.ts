import type { NftDetail, NftSummary } from '@/contracts/nft'

import { artAlt, contractNote, networkNote, royaltyNote, shortDescription, storyParagraphs } from './copy'
import { getDb } from './store'
import type { NftRecord } from './types'

export function imageFor(nft: NftRecord) {
  return { url: `/nft/${nft.art}-960.webp`, alt: artAlt(nft), width: 960, height: 960 }
}

export function totalAvailable(nft: NftRecord): number {
  return nft.editions.reduce((sum, edition) => sum + edition.available, 0)
}

export function toNftSummary(nft: NftRecord, favoriteIds: Set<string>): NftSummary {
  const db = getDb()
  const collection = db.collections.find((item) => item.id === nft.collectionId)

  return {
    id: nft.id,
    slug: nft.slug,
    name: nft.name,
    tokenId: nft.tokenId,
    image: imageFor(nft),
    priceEth: nft.priceEth,
    previousPriceEth: nft.previousPriceEth,
    rarity: nft.rarity,
    network: nft.network,
    collection: {
      id: collection?.id ?? nft.collectionId,
      slug: collection?.slug ?? nft.collectionId,
      name: collection?.name ?? 'Coleção',
    },
    available: totalAvailable(nft),
    isFavorite: favoriteIds.has(nft.id),
    listedAt: nft.listedAt,
    version: nft.version,
  }
}

export function toNftDetail(nft: NftRecord, favoriteIds: Set<string>): NftDetail {
  return {
    ...toNftSummary(nft, favoriteIds),
    description: shortDescription(nft),
    series: nft.series,
    story: storyParagraphs(nft),
    networkNote: networkNote(nft),
    contractNote: contractNote(nft),
    royaltyNote: royaltyNote(),
    images: Array.from({ length: 4 }, () => imageFor(nft)),
    editions: nft.editions.map((edition) => ({ ...edition })),
    attributes: nft.attributes.map((attribute) => ({ ...attribute })),
    rating: { ...nft.rating },
    contractAddress: nft.contractAddress,
    maxPerOrder: nft.maxPerOrder,
  }
}

export function favoriteIdsFor(userId: string | null): Set<string> {
  if (!userId) return new Set()
  return new Set(getDb().favorites[userId] ?? [])
}
