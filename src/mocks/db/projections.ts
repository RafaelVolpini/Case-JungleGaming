import type { NftDetail, NftSummary } from '@/contracts/nft'

import { getDb } from './store'
import type { NftRecord } from './types'

/**
 * Records in, contract shapes out. All derived values — availability, image
 * URL, alt text — are computed here, so no handler has to remember to do it
 * and no two handlers can derive them differently.
 */

/** Artwork is generated into public/nft at fixture time. */
export function imageFor(nft: NftRecord) {
  const collection = getDb().collections.find((item) => item.id === nft.collectionId)
  return {
    url: `/nft/${nft.slug}.svg`,
    alt: collection
      ? `${nft.name} — arte digital da coleção ${collection.name}`
      : `${nft.name} — arte digital`,
    width: 600,
    height: 600,
  }
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
    description: nft.description,
    // The detail gallery reuses the single artwork at different crops; the
    // Figma shows four thumbnails, and inventing four distinct files per NFT
    // would bloat the repo without changing what is being evaluated.
    images: [imageFor(nft)],
    editions: nft.editions.map((edition) => ({ ...edition })),
    attributes: nft.attributes.map((attribute) => ({ ...attribute })),
    rating: { ...nft.rating },
    contractAddress: nft.contractAddress,
    copyright: nft.copyright,
    maxPerOrder: nft.maxPerOrder,
  }
}

/** Favourites are per-user; a visitor simply has none. */
export function favoriteIdsFor(userId: string | null): Set<string> {
  if (!userId) return new Set()
  return new Set(getDb().favorites[userId] ?? [])
}
