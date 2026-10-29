import { NETWORK_LABELS } from '@/contracts/common'
import type { CatalogQuery, Collection } from '@/contracts/nft'

export type ActiveFilter = { key: string; label: string; clear: Partial<CatalogQuery> }

const RARITY_LABELS = { common: 'Comum', rare: 'Raro', legendary: 'Lendário' } as const

export const CLEAR_ALL_FILTERS: Partial<CatalogQuery> = {
  q: undefined,
  collections: [],
  networks: [],
  rarity: [],
  minPriceEth: undefined,
  maxPriceEth: undefined,
}

function without<T>(values: T[], value: T): T[] {
  return values.filter((candidate) => candidate !== value)
}

export function describeActiveFilters(
  query: CatalogQuery,
  collections: Pick<Collection, 'id' | 'name'>[] = [],
): ActiveFilter[] {
  const filters: ActiveFilter[] = []
  if (query.q) filters.push({ key: 'q', label: `Busca: ${query.q}`, clear: { q: undefined } })
  for (const id of query.collections) {
    const name = collections.find((collection) => collection.id === id)?.name ?? id
    filters.push({
      key: `collection-${id}`,
      label: `Coleção: ${name}`,
      clear: { collections: without(query.collections, id) },
    })
  }
  for (const network of query.networks) {
    filters.push({
      key: `network-${network}`,
      label: `Rede: ${NETWORK_LABELS[network]}`,
      clear: { networks: without(query.networks, network) },
    })
  }
  for (const rarity of query.rarity) {
    filters.push({
      key: `rarity-${rarity}`,
      label: `Raridade: ${RARITY_LABELS[rarity]}`,
      clear: { rarity: without(query.rarity, rarity) },
    })
  }
  if (query.minPriceEth || query.maxPriceEth) {
    filters.push({
      key: 'price',
      label: `Preço: ${query.minPriceEth ?? '0'} a ${query.maxPriceEth ?? 'sem limite'} ETH`,
      clear: { minPriceEth: undefined, maxPriceEth: undefined },
    })
  }
  return filters
}
