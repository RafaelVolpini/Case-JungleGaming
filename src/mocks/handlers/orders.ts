import { delay, http, HttpResponse } from 'msw'

import { createOrderSchema, IDEMPOTENCY_HEADER } from '@/contracts/order'

import { hashPayload } from '../db/crypto'
import { paginate } from '../db/catalog'
import {
  createOrder,
  findOrder,
  projectOrder,
  scheduleSettlement,
  settleDueOrders,
} from '../db/orders'
import { findQuote, isQuoteStale } from '../db/quotes'
import { getDb, mutateWith } from '../db/store'
import { getScenario, setScenario } from '../scenarios/state'
import { API } from './constants'
import { errorResponse, validationError } from './errors'
import { requireUser, resolveCaller } from './identity'
import { simulated } from './network'

function readSettled(ownerId: string, orderId: string) {
  return mutateWith(() => ({
    result: findOrder(orderId),
    events: settleDueOrders(ownerId),
  }))
}

export const orderHandlers = [
  http.post(
    `${API}/orders`,
    simulated(async ({ request }) => {
      const auth = requireUser(resolveCaller(request))
      if (!auth.ok) return auth.response

      const key = request.headers.get(IDEMPOTENCY_HEADER)
      if (!key) {
        return errorResponse('VALIDATION_ERROR', 'Informe a chave de idempotência.', {
          idempotencyKey: 'Cabeçalho obrigatório.',
        })
      }

      const parsed = createOrderSchema.safeParse(await request.json().catch(() => ({})))
      if (!parsed.success) return validationError('Dados do pedido inválidos.', parsed.error.issues)

      const db = getDb()
      const requestHash = await hashPayload(parsed.data)
      const known = db.idempotency.find(
        (entry) => entry.key === key && entry.ownerId === auth.user.id,
      )
      if (known) {
        if (known.requestHash !== requestHash) {
          return errorResponse(
            'CONFLICT',
            'Esta chave de idempotência já foi usada com outro conteúdo.',
          )
        }
        const existing = readSettled(auth.user.id, known.orderId)
        return existing
          ? HttpResponse.json(projectOrder(existing))
          : errorResponse('NOT_FOUND', 'Pedido não encontrado.')
      }

      const quote = findQuote(parsed.data.quoteId)
      if (!quote || quote.ownerId !== auth.user.id) {
        return errorResponse('NOT_FOUND', 'Cotação não encontrada.')
      }
      const wallet = db.wallets.find(
        (candidate) => candidate.id === parsed.data.walletId && candidate.ownerId === auth.user.id,
      )
      if (!wallet) return errorResponse('NOT_FOUND', 'Carteira não encontrada.')

      const stale = isQuoteStale(quote)
      if (stale) return errorResponse('QUOTE_STALE', stale)

      const scenario = getScenario()
      const order = mutateWith(() => {
        const created = createOrder({
          quote,
          wallet,
          outcome: scenario.payment === 'decline' ? 'declined' : 'confirmed',
        })
        db.idempotency.push({
          key,
          ownerId: auth.user.id,
          requestHash,
          orderId: created.order.id,
        })
        return { result: created.order, events: created.events }
      })
      scheduleSettlement(order.id)

      if (scenario.orderTimeout) {
        setScenario({ orderTimeout: false })
        await delay('infinite')
      }

      return HttpResponse.json(projectOrder(order), { status: 201 })
    }),
  ),

  http.get(
    `${API}/orders/:id`,
    simulated(({ request, params }) => {
      const auth = requireUser(resolveCaller(request))
      if (!auth.ok) return auth.response

      const order = readSettled(auth.user.id, String(params['id']))
      if (!order || order.ownerId !== auth.user.id) {
        return errorResponse('NOT_FOUND', 'Pedido não encontrado.')
      }
      return HttpResponse.json(projectOrder(order))
    }),
  ),

  http.get(
    `${API}/orders`,
    simulated(({ request }) => {
      const auth = requireUser(resolveCaller(request))
      if (!auth.ok) return auth.response

      mutateWith(() => ({ result: null, events: settleDueOrders(auth.user.id) }))
      const owned = getDb()
        .orders.filter((order) => order.ownerId === auth.user.id)
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      const page = paginate(owned, Number(new URL(request.url).searchParams.get('page') ?? 1))
      return HttpResponse.json({
        items: page.items.map(projectOrder),
        pagination: page.pagination,
      })
    }),
  ),
]
