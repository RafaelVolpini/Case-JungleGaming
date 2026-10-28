import { catalogQuerySchema, type CatalogQuery, type CatalogQueryInput } from '@/contracts/nft'
import { parseCatalogParams } from '@/lib/url/catalog-params'

export type CatalogSearch = Partial<CatalogQuery>

const defaults = catalogQuerySchema.parse({})

function isDefault(key: keyof CatalogQuery, value: unknown): boolean {
  return value === undefined || JSON.stringify(value) === JSON.stringify(defaults[key])
}

export function stripCatalogDefaults(query: CatalogQuery): CatalogSearch {
  return Object.fromEntries(
    Object.entries(query).filter(([key, value]) => !isDefault(key as keyof CatalogQuery, value)),
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
