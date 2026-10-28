import type { CatalogQuery } from '@/contracts/nft'
import { CATALOG_PER_PAGE } from '@/contracts/nft'
import { compareEth } from '@/lib/money/eth'

import { totalAvailable } from './projections'
import { getDb } from './store'
import type { NftRecord } from './types'

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000
const CATALOG_NOW = new Date('2026-10-01T00:00:00.000Z').getTime()

function matchesSearch(nft: NftRecord, term: string): boolean {
  const haystack = `${nft.name} ${nft.tokenId} ${nft.series}`.toLowerCase()
  return haystack.includes(term.toLowerCase())
}

function matchesFeed(nft: NftRecord, feed: CatalogQuery['feed']): boolean {
  switch (feed) {
    case 'all':
      return true
    case 'new':
      return CATALOG_NOW - new Date(nft.listedAt).getTime() <= FOURTEEN_DAYS_MS
    case 'trending':
      return nft.favoritesCount >= 100
  }
}

export function filterNfts(query: CatalogQuery): NftRecord[] {
  const { nfts } = getDb()

  return nfts.filter((nft) => {
    if (query.q && !matchesSearch(nft, query.q)) return false
    if (query.collections.length && !query.collections.includes(nft.collectionId)) return false
    if (query.networks.length && !query.networks.includes(nft.network)) return false
    if (query.rarity.length && !query.rarity.includes(nft.rarity)) return false
    if (query.minPriceEth && compareEth(nft.priceEth, query.minPriceEth) < 0) return false
    if (query.maxPriceEth && compareEth(nft.priceEth, query.maxPriceEth) > 0) return false
    if (!matchesFeed(nft, query.feed)) return false
    return true
  })
}

const COMPARATORS: Record<CatalogQuery['sort'], (a: NftRecord, b: NftRecord) => number> = {
  recent: (a, b) => Date.parse(b.listedAt) - Date.parse(a.listedAt),
  'price-asc': (a, b) => compareEth(a.priceEth, b.priceEth),
  'price-desc': (a, b) => compareEth(b.priceEth, a.priceEth),
  popular: (a, b) => b.favoritesCount - a.favoritesCount,
}

export function sortNfts(nfts: NftRecord[], sort: CatalogQuery['sort']): NftRecord[] {
  const primary = COMPARATORS[sort]
  return [...nfts].sort((a, b) => primary(a, b) || a.id.localeCompare(b.id))
}

export function paginate<T>(items: T[], page: number, perPage = CATALOG_PER_PAGE) {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * perPage

  return {
    items: items.slice(start, start + perPage),
    pagination: { page: safePage, perPage, total, totalPages },
  }
}

export function collectionCounts(): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const nft of getDb().nfts) {
    counts[nft.collectionId] = (counts[nft.collectionId] ?? 0) + 1
  }
  return counts
}

export function networkCounts(): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const nft of getDb().nfts) {
    counts[nft.network] = (counts[nft.network] ?? 0) + 1
  }
  return counts
}

export function findNftBySlug(slug: string): NftRecord | undefined {
  return getDb().nfts.find((nft) => nft.slug === slug)
}

export function findNftById(id: string): NftRecord | undefined {
  return getDb().nfts.find((nft) => nft.id === id)
}

export function isSoldOut(nft: NftRecord): boolean {
  return totalAvailable(nft) === 0
}
