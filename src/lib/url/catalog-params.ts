import {
  catalogQuerySchema,
  type CatalogQuery,
  type CatalogQueryInput,
} from '@/contracts/nft'

/**
 * One serialiser for the catalog query, used by the router AND by the MSW
 * handler. Sharing it is the point: if the URL and the API ever disagreed
 * about how `collections` is encoded, filters would silently stop applying.
 *
 * Arrays are comma-separated rather than repeated keys — shorter URLs, and
 * what the Figma's filter combinations would produce is readable by a human.
 */

function list(value: string | null): string[] {
  return value ? value.split(',').filter(Boolean) : []
}

export function parseCatalogParams(params: URLSearchParams): CatalogQuery {
  const raw: CatalogQueryInput = {
    q: params.get('q') ?? undefined,
    collections: list(params.get('collections')),
    networks: list(params.get('networks')) as CatalogQueryInput['networks'],
    rarity: list(params.get('rarity')) as CatalogQueryInput['rarity'],
    minPriceEth: (params.get('minPriceEth') ?? undefined) as CatalogQueryInput['minPriceEth'],
    maxPriceEth: (params.get('maxPriceEth') ?? undefined) as CatalogQueryInput['maxPriceEth'],
    feed: (params.get('feed') ?? undefined) as CatalogQueryInput['feed'],
    sort: (params.get('sort') ?? undefined) as CatalogQueryInput['sort'],
    page: params.get('page') ? Number(params.get('page')) : undefined,
  }

  // Unknown or malformed values fall back to the defaults rather than throwing:
  // a hand-edited URL should degrade to a sane catalog, not a crash.
  const result = catalogQuerySchema.safeParse(raw)
  return result.success ? result.data : catalogQuerySchema.parse({})
}

/**
 * Only non-default values are written, so the canonical browsing URL stays
 * clean (`/` rather than `/?feed=all&sort=recent&page=1`) and two routes to
 * the same state produce the same query key.
 */
export function serializeCatalogParams(query: Partial<CatalogQuery>): URLSearchParams {
  const params = new URLSearchParams()

  if (query.q) params.set('q', query.q)
  if (query.collections?.length) params.set('collections', query.collections.join(','))
  if (query.networks?.length) params.set('networks', query.networks.join(','))
  if (query.rarity?.length) params.set('rarity', query.rarity.join(','))
  if (query.minPriceEth) params.set('minPriceEth', query.minPriceEth)
  if (query.maxPriceEth) params.set('maxPriceEth', query.maxPriceEth)
  if (query.feed && query.feed !== 'all') params.set('feed', query.feed)
  if (query.sort && query.sort !== 'recent') params.set('sort', query.sort)
  if (query.page && query.page > 1) params.set('page', String(query.page))

  return params
}
