import { http, HttpResponse } from 'msw'

import { createQuoteSchema } from '@/contracts/quote'

import { acknowledgeQuote, createQuote, findQuote, projectQuote } from '../db/quotes'
import { getDb, mutate } from '../db/store'
import { API } from './constants'
import { errorResponse, validationError } from './errors'
import { requireUser, resolveCaller } from './identity'
import { simulated } from './network'

const EMPTY_CART_MESSAGE = 'Seu carrinho está vazio.'

export const quoteHandlers = [
  http.post(
    `${API}/quotes`,
    simulated(async ({ request }) => {
      const auth = requireUser(resolveCaller(request))
      if (!auth.ok) return auth.response

      const parsed = createQuoteSchema.safeParse(await request.json().catch(() => ({})))
      if (!parsed.success)
        return validationError('Dados da cotação inválidos.', parsed.error.issues)

      const wallet = getDb().wallets.find(
        (candidate) => candidate.id === parsed.data.walletId && candidate.ownerId === auth.user.id,
      )
      if (!wallet) return errorResponse('NOT_FOUND', 'Carteira não encontrada.')

      return mutate(() => {
        const outcome = createQuote({ ownerId: auth.user.id, ...parsed.data })
        if (!outcome.ok) return errorResponse('CONFLICT', EMPTY_CART_MESSAGE)
        return HttpResponse.json(projectQuote(outcome.quote))
      })
    }),
  ),

  http.post(
    `${API}/quotes/:id/acknowledge`,
    simulated(({ request, params }) => {
      const auth = requireUser(resolveCaller(request))
      if (!auth.ok) return auth.response

      const quote = findQuote(String(params['id']))
      if (!quote || quote.ownerId !== auth.user.id) {
        return errorResponse('NOT_FOUND', 'Cotação não encontrada.')
      }

      return mutate(() => {
        const outcome = acknowledgeQuote(quote)
        if (!outcome.ok) return errorResponse('CONFLICT', EMPTY_CART_MESSAGE)
        return HttpResponse.json(projectQuote(outcome.quote))
      })
    }),
  ),
]
