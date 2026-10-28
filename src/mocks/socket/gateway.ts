import { toSocketIo } from '@mswjs/socket.io-binding'
import { ws } from 'msw'

import { SOCKET_EVENTS } from '@/contracts/events'
import { socketUrlFromOrigin } from '@/lib/realtime/constants'

import { findNftById } from '../db/catalog'
import { totalAvailable } from '../db/projections'
import { getDb, isDbReady, onDbEvent, type DbEvent } from '../db/store'

export const socketLink = ws.link(socketUrlFromOrigin(window.location.origin))

const HEARTBEAT_INTERVAL_MS = 20_000

type ConnectedClient = {
  emit: (event: string, payload: unknown) => void
  userId: string | null
}

const clients = new Set<ConnectedClient>()

export type SocketGatewayOptions = {
  heartbeat?: boolean
  onLog?: (line: string) => void
}

function broadcast(event: DbEvent): void {
  if (!isDbReady() || clients.size === 0) return
  const at = new Date().toISOString()

  if (event.type === 'nft.updated') {
    const nft = findNftById(event.nftId)
    if (!nft) return

    const payload = {
      eventId: crypto.randomUUID(),
      resource: 'nft' as const,
      id: nft.id,
      version: nft.version,
      priceEth: nft.priceEth,
      previousPriceEth: nft.previousPriceEth,
      available: totalAvailable(nft),
      editions: nft.editions.map((edition) => ({
        id: edition.id,
        available: edition.available,
        priceEth: edition.priceEth,
      })),
      at,
    }

    for (const client of clients) client.emit(SOCKET_EVENTS.nftUpdated, payload)
    return
  }

  const order = getDb().orders.find((candidate) => candidate.id === event.orderId)
  if (!order) return

  const payload = {
    eventId: crypto.randomUUID(),
    resource: 'order' as const,
    id: order.id,
    version: order.version,
    status: order.status,
    confirmedAt: order.confirmedAt,
    declinedReason: order.declinedReason,
    ownerId: order.ownerId,
    at,
  }

  for (const client of clients) {
    if (client.userId === order.ownerId) client.emit(SOCKET_EVENTS.orderUpdated, payload)
  }
}

let unsubscribe: (() => void) | null = null

function ensureSubscription(): void {
  unsubscribe ??= onDbEvent(broadcast)
}

export function createSocketGateway({
  heartbeat = true,
  onLog = () => {},
}: SocketGatewayOptions = {}) {
  ensureSubscription()

  return socketLink.addEventListener('connection', (connection) => {
    const io = toSocketIo(connection)

    const client: ConnectedClient = {
      emit: (event, payload) => io.client.emit(event, payload),
      userId: null,
    }
    clients.add(client)
    onLog('connection opened')

    let heartbeatTimer: ReturnType<typeof setInterval> | undefined
    if (heartbeat) {
      heartbeatTimer = setInterval(() => {
        connection.client.send('2')
      }, HEARTBEAT_INTERVAL_MS)
    }

    connection.client.addEventListener('close', () => {
      clearInterval(heartbeatTimer)
      clients.delete(client)
      onLog('connection closed')
    })

    io.client.on(SOCKET_EVENTS.identify, (_event, payload: unknown) => {
      const userId = (payload as { userId?: string | null } | undefined)?.userId ?? null
      client.userId = userId
      onLog(`identified as ${userId ?? 'visitante'}`)
    })

    io.client.on('spike:ping', (_event, payload: unknown) => {
      io.client.emit('spike:pong', { echo: payload, at: Date.now() })
    })
  })
}
