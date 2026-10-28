import { setupWorker } from 'msw/browser'

import { createSeed, prepareSeed } from './db/seed'
import { loadOrSeed } from './db/store'
import { authHandlers } from './handlers/auth'
import { cartHandlers } from './handlers/cart'
import { devHandlers } from './handlers/dev'
import { devNftHandlers } from './handlers/dev-nft'
import { favoriteHandlers } from './handlers/favorites'
import { nftHandlers } from './handlers/nfts'
import { orderHandlers } from './handlers/orders'
import { profileHandlers } from './handlers/profile'
import { quoteHandlers } from './handlers/quotes'
import { walletHandlers } from './handlers/wallets'
import { loadScenario } from './scenarios/state'
import { createSocketGateway, type SocketGatewayOptions } from './socket/gateway'

export async function startMockWorker(options: SocketGatewayOptions = {}) {
  await prepareSeed()
  const { seeded } = loadOrSeed(createSeed)
  const scenario = loadScenario()

  const worker = setupWorker(
    ...devHandlers,
    ...devNftHandlers,
    ...authHandlers,
    ...nftHandlers,
    ...favoriteHandlers,
    ...cartHandlers,
    ...quoteHandlers,
    ...orderHandlers,
    ...profileHandlers,
    ...walletHandlers,
    createSocketGateway(options),
  )

  await worker.start({ onUnhandledRequest: 'bypass', quiet: true })

  return { seeded, scenario }
}
