import { http, HttpResponse } from 'msw'

import { findNftById, paginate } from '../db/catalog'
import { favoriteIdsFor, toNftSummary } from '../db/projections'
import { getDb, mutate, nextVersion } from '../db/store'
import { API, errorResponse, requireUser, resolveCaller, simulateNetwork } from './helpers'

export const favoriteHandlers = [
  http.get(`${API}/favorites/ids`, async ({ request }) => {
    const failure = await simulateNetwork(request)
    if (failure) return failure

    const auth = requireUser(resolveCaller(request))
    if (!auth.ok) return auth.response

    return HttpResponse.json({ nftIds: getDb().favorites[auth.user.id] ?? [] })
  }),

  http.get(`${API}/favorites`, async ({ request }) => {
    const failure = await simulateNetwork(request)
    if (failure) return failure

    const auth = requireUser(resolveCaller(request))
    if (!auth.ok) return auth.response

    const ids = getDb().favorites[auth.user.id] ?? []
    const favorites = favoriteIdsFor(auth.user.id)
    const nfts = ids
      .map((id) => findNftById(id))
      .filter((nft): nft is NonNullable<typeof nft> => nft !== undefined)

    const page = paginate(nfts, Number(new URL(request.url).searchParams.get('page') ?? 1))

    return HttpResponse.json({
      items: page.items.map((nft) => toNftSummary(nft, favorites)),
      pagination: page.pagination,
    })
  }),

  http.put(`${API}/favorites/:nftId`, async ({ request, params }) => {
    const failure = await simulateNetwork(request)
    if (failure) return failure

    const auth = requireUser(resolveCaller(request))
    if (!auth.ok) return auth.response

    const nftId = String(params['nftId'])
    const nft = findNftById(nftId)
    if (!nft) return errorResponse('NOT_FOUND', 'Este NFT não existe.')

    const userId = auth.user.id

    return mutate(
      (db) => {
        const ids = db.favorites[userId] ?? []
        if (!ids.includes(nftId)) {
          db.favorites[userId] = [...ids, nftId]
          nft.favoritesCount += 1
          nft.version = nextVersion()
        }
        return new HttpResponse(null, { status: 204 })
      },
      [{ type: 'nft.updated', nftId }],
    )
  }),

  http.delete(`${API}/favorites/:nftId`, async ({ request, params }) => {
    const failure = await simulateNetwork(request)
    if (failure) return failure

    const auth = requireUser(resolveCaller(request))
    if (!auth.ok) return auth.response

    const nftId = String(params['nftId'])
    const nft = findNftById(nftId)
    if (!nft) return errorResponse('NOT_FOUND', 'Este NFT não existe.')

    const userId = auth.user.id

    return mutate(
      (db) => {
        const ids = db.favorites[userId] ?? []
        if (ids.includes(nftId)) {
          db.favorites[userId] = ids.filter((id) => id !== nftId)
          nft.favoritesCount = Math.max(0, nft.favoritesCount - 1)
          nft.version = nextVersion()
        }
        return new HttpResponse(null, { status: 204 })
      },
      [{ type: 'nft.updated', nftId }],
    )
  }),
]
