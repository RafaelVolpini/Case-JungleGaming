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
