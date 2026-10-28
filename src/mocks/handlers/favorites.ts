import { http, HttpResponse } from 'msw'

import { findNftById, paginate } from '../db/catalog'
import { favoriteIdsFor, toNftSummary } from '../db/projections'
import { getDb, mutateWith, nextVersion } from '../db/store'
import { API } from './constants'
import { errorResponse } from './errors'
import { requireUser, resolveCaller } from './identity'
import { simulated } from './network'

function changeFavorite(add: boolean) {
  return simulated(({ request, params }) => {
    const auth = requireUser(resolveCaller(request))
    if (!auth.ok) return auth.response

    const nftId = String(params['nftId'])
    const nft = findNftById(nftId)
    if (!nft) return errorResponse('NOT_FOUND', 'Este NFT não existe.')

    const userId = auth.user.id

    return mutateWith((db) => {
      const ids = db.favorites[userId] ?? []
      const alreadyFavorite = ids.includes(nftId)
      const changed = add !== alreadyFavorite

      if (changed) {
        db.favorites[userId] = add ? [...ids, nftId] : ids.filter((id) => id !== nftId)
        nft.favoritesCount = Math.max(0, nft.favoritesCount + (add ? 1 : -1))
        nft.version = nextVersion()
      }

      return {
        result: new HttpResponse(null, { status: 204 }),
        events: changed ? [{ type: 'nft.updated' as const, nftId }] : [],
      }
    })
  })
}

export const favoriteHandlers = [
  http.get(
    `${API}/favorites/ids`,
    simulated(({ request }) => {
      const auth = requireUser(resolveCaller(request))
      if (!auth.ok) return auth.response
      return HttpResponse.json({ nftIds: getDb().favorites[auth.user.id] ?? [] })
    }),
  ),

  http.get(
    `${API}/favorites`,
    simulated(({ request }) => {
      const auth = requireUser(resolveCaller(request))
      if (!auth.ok) return auth.response

      const favorites = favoriteIdsFor(auth.user.id)
      const nfts = (getDb().favorites[auth.user.id] ?? [])
        .map((id) => findNftById(id))
        .filter((nft): nft is NonNullable<typeof nft> => nft !== undefined)
      const page = paginate(nfts, Number(new URL(request.url).searchParams.get('page') ?? 1))

      return HttpResponse.json({
        items: page.items.map((nft) => toNftSummary(nft, favorites)),
        pagination: page.pagination,
      })
    }),
  ),

  http.put(`${API}/favorites/:nftId`, changeFavorite(true)),
  http.delete(`${API}/favorites/:nftId`, changeFavorite(false)),
]
