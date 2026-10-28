import type { ManagerOptions, SocketOptions } from 'socket.io-client'

export const SOCKET_PATH = '/socket.io'

export function socketUrlFromOrigin(origin: string): string {
  return `${origin.replace(/^http/, 'ws')}${SOCKET_PATH}`
}

export const SOCKET_OPTIONS: Partial<ManagerOptions & SocketOptions> = {
  path: SOCKET_PATH,
  addTrailingSlash: false,
  transports: ['websocket'],
  autoConnect: false,
}
