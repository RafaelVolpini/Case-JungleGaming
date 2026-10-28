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
import { API } from './constants'
import { errorResponse } from './errors'
import { resolveCaller } from './identity'
import { simulated } from './network'

const NETWORKS = ['ethereum', 'polygon', 'solana'] as const

export const nftHandlers = [
  http.get(
    `${API}/nfts`,
    simulated(({ request }) => {
      const query = parseCatalogParams(new URL(request.url).searchParams)
      const favorites = favoriteIdsFor(resolveCaller(request).user?.id ?? null)
      const page = paginate(sortNfts(filterNfts(query), query.sort), query.page)

      return HttpResponse.json({
        items: page.items.map((nft) => toNftSummary(nft, favorites)),
        pagination: page.pagination,
      })
    }),
  ),

  http.get(
    `${API}/nfts/:slug`,
    simulated(({ request, params }) => {
      const nft = findNftBySlug(String(params['slug']))
      if (!nft) {
        return errorResponse('NOT_FOUND', 'Este NFT não existe ou foi removido do mercado.')
      }
      const favorites = favoriteIdsFor(resolveCaller(request).user?.id ?? null)
      return HttpResponse.json(toNftDetail(nft, favorites))
    }),
  ),

  http.get(
    `${API}/collections`,
    simulated(() => {
      const counts = collectionCounts()
      return HttpResponse.json(
        getDb().collections.map((collection) => ({
          ...collection,
          nftCount: counts[collection.id] ?? 0,
        })),
      )
    }),
  ),

  http.get(
    `${API}/networks`,
    simulated(() => {
      const counts = networkCounts()
      return HttpResponse.json(
        NETWORKS.map((network) => ({ id: network, nftCount: counts[network] ?? 0 })),
      )
    }),
  ),
]
