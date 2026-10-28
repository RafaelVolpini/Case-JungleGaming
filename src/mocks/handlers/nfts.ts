import { http, HttpResponse } from 'msw'

import { parseCatalogParams } from '@/lib/url/catalog-params'

import {
  collectionCounts,
  filterNfts,
  findNftBySlug,
  networkCounts,
  paginate,
  sortNfts,
} from '../db/catalog'
import { favoriteIdsFor, toNftDetail, toNftSummary } from '../db/projections'
import { getDb } from '../db/store'
import { API, errorResponse, resolveCaller, simulateNetwork } from './helpers'

export const nftHandlers = [
  /**
   * The catalog. Filters, sort and page all come from the URL and are parsed
   * by the same module the router uses, so what the address bar says and what
   * the API receives cannot drift apart.
   */
  http.get(`${API}/nfts`, async ({ request }) => {
    const failure = await simulateNetwork(request)
    if (failure) return failure

    const query = parseCatalogParams(new URL(request.url).searchParams)
    const caller = resolveCaller(request)
    const favorites = favoriteIdsFor(caller.user?.id ?? null)

    const matched = sortNfts(filterNfts(query), query.sort)
    const page = paginate(matched, query.page)

    return HttpResponse.json({
      items: page.items.map((nft) => toNftSummary(nft, favorites)),
      pagination: page.pagination,
    })
  }),

  http.get(`${API}/nfts/:slug`, async ({ request, params }) => {
    const failure = await simulateNetwork(request)
    if (failure) return failure

    const slug = String(params['slug'])
    const nft = findNftBySlug(slug)
    if (!nft) {
      return errorResponse('NOT_FOUND', 'Este NFT não existe ou foi removido do mercado.')
    }

    const caller = resolveCaller(request)
    return HttpResponse.json(toNftDetail(nft, favoriteIdsFor(caller.user?.id ?? null)))
  }),

  /**
   * Collections carry their own counts so the sidebar never has to derive them
   * from a page of results — which would show the count of the current page
   * rather than of the collection.
   */
  http.get(`${API}/collections`, async ({ request }) => {
    const failure = await simulateNetwork(request)
    if (failure) return failure

    const counts = collectionCounts()
    return HttpResponse.json(
      getDb().collections.map((collection) => ({
        ...collection,
        nftCount: counts[collection.id] ?? 0,
      })),
    )
  }),

  http.get(`${API}/networks`, async ({ request }) => {
    const failure = await simulateNetwork(request)
    if (failure) return failure

    const counts = networkCounts()
    return HttpResponse.json(
      (['ethereum', 'polygon', 'solana'] as const).map((network) => ({
        id: network,
        nftCount: counts[network] ?? 0,
      })),
    )
  }),
]
