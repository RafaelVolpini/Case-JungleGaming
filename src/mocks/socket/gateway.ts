import { toSocketIo } from '@mswjs/socket.io-binding'
import { ws } from 'msw'

import { SOCKET_EVENTS } from '@/contracts/events'
import { socketUrlFromOrigin } from '@/lib/realtime/constants'

import { findNftById } from '../db/catalog'
import { mockId } from '../db/ids'
import { getDb, isDbReady, onDbEvent, type DbEvent } from '../db/store'
import { connectedClients, registerClient, unregisterClient, type ConnectedClient } from './clients'
import { rememberNftEvent } from './event-log'
import { buildNftPayload } from './nft-payload'
import { isOutageActive, refuseConnection } from './outage'

export const socketLink = ws.link(socketUrlFromOrigin(window.location.origin))

const HEARTBEAT_INTERVAL_MS = 20_000

export type SocketGatewayOptions = {
  heartbeat?: boolean
  onLog?: (line: string) => void
}

function broadcastNftUpdated(nftId: string, at: string): void {
  const nft = findNftById(nftId)
  if (!nft) return

  const payload = buildNftPayload(nft, at)
  rememberNftEvent(payload)
  for (const client of connectedClients()) client.emit(SOCKET_EVENTS.nftUpdated, payload)
}

function broadcastOrderUpdated(orderId: string, at: string): void {
  const order = getDb().orders.find((candidate) => candidate.id === orderId)
  if (!order) return

  const payload = {
    eventId: mockId('evt'),
    resource: 'order' as const,
    id: order.id,
    version: order.version,
    status: order.status,
    confirmedAt: order.confirmedAt,
    declinedReason: order.declinedReason,
    ownerId: order.ownerId,
    at,
  }

  for (const client of connectedClients()) {
    if (client.userId === order.ownerId) client.emit(SOCKET_EVENTS.orderUpdated, payload)
  }
}

function broadcast(event: DbEvent): void {
  if (!isDbReady() || connectedClients().size === 0) return
  const at = new Date().toISOString()
  if (event.type === 'nft.updated') broadcastNftUpdated(event.nftId, at)
  else broadcastOrderUpdated(event.orderId, at)
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
    if (isOutageActive()) {
      refuseConnection(connection.client)
      onLog('connection refused during outage')
      return
    }

    const io = toSocketIo(connection)
    const client: ConnectedClient = {
      emit: (event, payload) => io.client.emit(event, payload),
      close: () => connection.client.close(),
      userId: null,
    }
    registerClient(client)
    onLog('connection opened')

    let heartbeatTimer: ReturnType<typeof setInterval> | undefined
    if (heartbeat) {
      heartbeatTimer = setInterval(() => {
        connection.client.send('2')
      }, HEARTBEAT_INTERVAL_MS)
    }

    connection.client.addEventListener('close', () => {
      clearInterval(heartbeatTimer)
      unregisterClient(client)
      onLog('connection closed')
    })

    io.client.on(SOCKET_EVENTS.identify, (_event, payload: unknown) => {
      const userId = (payload as { userId?: string | null } | undefined)?.userId ?? null
      client.userId = userId
      onLog(`identified as ${userId ?? 'visitante'}`)
    })
  })
}
