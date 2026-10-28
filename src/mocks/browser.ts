import { setupWorker } from 'msw/browser'

import { createSeed, prepareSeed } from './db/seed'
import { loadOrSeed } from './db/store'
import { authHandlers } from './handlers/auth'
import { cartHandlers } from './handlers/cart'
import { devHandlers } from './handlers/dev'
import { favoriteHandlers } from './handlers/favorites'
import { nftHandlers } from './handlers/nfts'
import { loadScenario } from './scenarios/config'
import { createSocketGateway, type SocketGatewayOptions } from './socket/gateway'

/**
 * Order matters here. The database must exist before any handler can run, and
 * the worker must be started before anything imports `socket.io-client` —
 * engine.io captures `globalThis.WebSocket` at module scope and MSW only
 * patches it inside `start()`. See ARCHITECTURE.md §2.2.
 *
 * `devHandlers` come first so the control plane stays reachable even when a
 * failure scenario is blanketing the API.
 */
export async function startMockWorker(options: SocketGatewayOptions = {}) {
  await prepareSeed()
  const { seeded } = loadOrSeed(createSeed)
  const scenario = loadScenario()

  const worker = setupWorker(
    ...devHandlers,
    ...authHandlers,
    ...nftHandlers,
    ...favoriteHandlers,
    ...cartHandlers,
    createSocketGateway(options),
  )

  await worker.start({ onUnhandledRequest: 'bypass', quiet: true })

  return { seeded, scenario }
}
