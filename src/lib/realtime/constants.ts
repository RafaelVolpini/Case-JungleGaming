import type { ManagerOptions, SocketOptions } from 'socket.io-client'

/**
 * Shared by the client and the MSW gateway.
 *
 * This module must NOT import `socket.io-client` at runtime. engine.io-client
 * captures `globalThis.WebSocket` at module-evaluation time, so if anything
 * pulls it into the graph before `worker.start()` patches the global, MSW can
 * never intercept the connection. The `import type` above is erased at build
 * time and therefore safe. See ARCHITECTURE.md §2.2.
 */

/** Engine.IO path. No trailing slash — MSW strips it from handler patterns. */
export const SOCKET_PATH = '/socket.io'

export function socketUrlFromOrigin(origin: string): string {
  return `${origin.replace(/^http/, 'ws')}${SOCKET_PATH}`
}

/**
 * `transports` and `addTrailingSlash` exist purely so MSW can intercept the
 * connection; both are harmless against a real Socket.IO server.
 */
export const SOCKET_OPTIONS: Partial<ManagerOptions & SocketOptions> = {
  path: SOCKET_PATH,
  addTrailingSlash: false,
  transports: ['websocket'],
  autoConnect: false,
}
