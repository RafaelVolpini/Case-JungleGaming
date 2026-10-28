import {
  catalogQuerySchema,
  type CatalogQuery,
  type CatalogQueryInput,
} from '@/contracts/nft'

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

  const result = catalogQuerySchema.safeParse(raw)
  return result.success ? result.data : catalogQuerySchema.parse({})
}

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
