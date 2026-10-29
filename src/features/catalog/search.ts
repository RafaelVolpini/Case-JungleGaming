import {
  catalogQuerySchema,
  DEFAULT_SORT_BY_FEED,
  type CatalogQuery,
  type CatalogQueryInput,
} from '@/contracts/nft'
import { parseCatalogParams } from '@/lib/url/catalog-params'

export type CatalogSearch = Partial<CatalogQuery>

const defaults = catalogQuerySchema.parse({})

function defaultFor(key: keyof CatalogQuery, query: CatalogQuery): unknown {
  return key === 'sort' ? DEFAULT_SORT_BY_FEED[query.feed] : defaults[key]
}

function isDefault(key: keyof CatalogQuery, value: unknown, query: CatalogQuery): boolean {
  return value === undefined || JSON.stringify(value) === JSON.stringify(defaultFor(key, query))
}

export function stripCatalogDefaults(query: CatalogQuery): CatalogSearch {
  return Object.fromEntries(
    Object.entries(query).filter(
      ([key, value]) => !isDefault(key as keyof CatalogQuery, value, query),
    ),
  ) as CatalogSearch
}

export function catalogSearch(input: CatalogQueryInput = {}): CatalogSearch {
  return stripCatalogDefaults(catalogQuerySchema.parse(input))
}

export function parseCatalogSearch(raw: Record<string, unknown>): CatalogSearch {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(raw)) {
    if (value !== undefined && value !== null) params.set(key, String(value))
  }
  return stripCatalogDefaults(parseCatalogParams(params))
}

export function resolveCatalogQuery(search: CatalogSearch): CatalogQuery {
  return catalogQuerySchema.parse(search)
}
