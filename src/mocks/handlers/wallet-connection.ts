import { http, HttpResponse } from 'msw'

import { getDb } from '../db/store'
import { getScenario } from '../scenarios/state'
import { API } from './constants'
import { errorResponse } from './errors'
import { requireUser, resolveCaller } from './identity'
import { simulated } from './network'

function ownedWalletId(ownerId: string, id: string): string | null {
  const wallet = getDb().wallets.find(
    (candidate) => candidate.id === id && candidate.ownerId === ownerId,
  )
  return wallet ? wallet.id : null
}

export const walletConnectionHandlers = [
  http.post(
    `${API}/wallets/:id/connect`,
    simulated(({ request, params }) => {
      const auth = requireUser(resolveCaller(request))
      if (!auth.ok) return auth.response

      const walletId = ownedWalletId(auth.user.id, String(params['id']))
      if (!walletId) return errorResponse('NOT_FOUND', 'Carteira não encontrada.')

      if (getScenario().wallet === 'reject') {
        return errorResponse('FORBIDDEN', 'A carteira recusou a solicitação de conexão.')
      }
      return HttpResponse.json({ walletId, connected: true })
    }),
  ),

  http.post(
    `${API}/wallets/:id/disconnect`,
    simulated(({ request, params }) => {
      const auth = requireUser(resolveCaller(request))
      if (!auth.ok) return auth.response

      const walletId = ownedWalletId(auth.user.id, String(params['id']))
      if (!walletId) return errorResponse('NOT_FOUND', 'Carteira não encontrada.')
      return HttpResponse.json({ walletId, connected: false })
    }),
  ),
]
