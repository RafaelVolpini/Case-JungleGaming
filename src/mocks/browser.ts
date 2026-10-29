import { setupWorker } from 'msw/browser'

import { yieldToMain } from '@/lib/yield-to-main'

import { createSeed, prepareSeed } from './db/seed'
import { loadOrSeed } from './db/store'
import { authHandlers } from './handlers/auth'
import { cartHandlers } from './handlers/cart'
import { devHandlers } from './handlers/dev'
import { devNftHandlers } from './handlers/dev-nft'
import { devSocketHandlers } from './handlers/dev-socket'
import { favoriteHandlers } from './handlers/favorites'
import { healthHandlers } from './handlers/health'
import { nftHandlers } from './handlers/nfts'
import { orderHandlers } from './handlers/orders'
import { profileHandlers } from './handlers/profile'
import { quoteHandlers } from './handlers/quotes'
import { walletConnectionHandlers } from './handlers/wallet-connection'
import { walletHandlers } from './handlers/wallets'
import { loadScenario } from './scenarios/state'
import { createSocketGateway, type SocketGatewayOptions } from './socket/gateway'
import { guardMockWorker } from './worker-guard'

export async function startMockWorker(options: SocketGatewayOptions = {}) {
  await prepareSeed()
  await yieldToMain()
  const { seeded } = loadOrSeed(createSeed)
  const scenario = loadScenario()
  await yieldToMain()

  const worker = setupWorker(
    ...nftHandlers,
    ...cartHandlers,
    ...authHandlers,
    ...favoriteHandlers,
    ...quoteHandlers,
    ...orderHandlers,
    ...profileHandlers,
    ...walletHandlers,
    ...walletConnectionHandlers,
    ...healthHandlers,
    ...devHandlers,
    ...devNftHandlers,
    ...devSocketHandlers,
    createSocketGateway(options),
  )

  await worker.start({ onUnhandledRequest: 'bypass', quiet: true })
  guardMockWorker()

  return { seeded, scenario }
}
