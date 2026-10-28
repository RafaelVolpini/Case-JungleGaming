import { io, type Socket } from 'socket.io-client'

import type { ClientToServerEvents, ServerToClientEvents } from '@/contracts/events'

import { SOCKET_OPTIONS } from './constants'

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>

/** The application socket. Event names are constrained by the contracts. */
export function createSocket(): AppSocket {
  return io(window.location.origin, SOCKET_OPTIONS)
}
