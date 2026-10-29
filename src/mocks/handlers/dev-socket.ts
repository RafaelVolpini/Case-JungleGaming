import { http, HttpResponse } from 'msw'
import { z } from 'zod'

import { SOCKET_EVENTS } from '@/contracts/events'

import { findNftBySlug } from '../db/catalog'
import { mockId } from '../db/ids'
import {
  connectedClientCount,
  dropConnectedClients,
  emitToConnectedClients,
} from '../socket/clients'
import { nftEventHistory } from '../socket/event-log'
import { holdConnections, outageRemainingMs, releaseConnections } from '../socket/outage'
import { API } from './constants'
import { errorResponse, validationError } from './errors'

const MAX_HOLD_MS = 60_000

const dropSchema = z.object({ holdMs: z.number().int().min(0).max(MAX_HOLD_MS).default(0) })
const emitSchema = z.object({ event: z.string(), payload: z.unknown() })
const replaySchema = z.object({ slug: z.string(), mode: z.enum(['duplicate', 'stale']) })

export const devSocketHandlers = [
  http.get(`${API}/__mock__/socket`, () =>
    HttpResponse.json({ clients: connectedClientCount(), outageMs: outageRemainingMs() }),
  ),

  http.post(`${API}/__mock__/socket/drop`, async ({ request }) => {
    const parsed = dropSchema.safeParse(await request.json().catch(() => ({})))
    if (!parsed.success) return validationError('Parâmetros inválidos.', parsed.error.issues)
    if (parsed.data.holdMs > 0) holdConnections(parsed.data.holdMs)
    return HttpResponse.json({ dropped: dropConnectedClients(), holdMs: parsed.data.holdMs })
  }),

  http.post(`${API}/__mock__/socket/reconnect`, () => {
    releaseConnections()
    return HttpResponse.json({ outageMs: 0 })
  }),

  http.post(`${API}/__mock__/socket/emit`, async ({ request }) => {
    const parsed = emitSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return validationError('Evento inválido.', parsed.error.issues)
    const { event, payload } = parsed.data
    return HttpResponse.json({ delivered: emitToConnectedClients(event, payload) })
  }),

  http.post(`${API}/__mock__/socket/replay`, async ({ request }) => {
    const parsed = replaySchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return validationError('Parâmetros inválidos.', parsed.error.issues)
    const { slug, mode } = parsed.data

    const nft = findNftBySlug(slug)
    if (!nft) return errorResponse('NOT_FOUND', 'NFT não encontrado.')
    const record = nftEventHistory(nft.id)
    if (!record) return errorResponse('CONFLICT', 'Altere o preço ou a disponibilidade primeiro.')

    const payload =
      mode === 'duplicate'
        ? record.latest
        : { ...(record.earlier ?? record.latest), eventId: mockId('evt') }
    const delivered = emitToConnectedClients(SOCKET_EVENTS.nftUpdated, payload)
    return HttpResponse.json({
      delivered,
      mode,
      eventId: payload.eventId,
      version: payload.version,
    })
  }),
]
