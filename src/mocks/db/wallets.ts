import type { Wallet } from '@/contracts/wallet'

import { getDb } from './store'
import type { WalletRecord } from './types'

export function walletsOf(ownerId: string): WalletRecord[] {
  return getDb()
    .wallets.filter((wallet) => wallet.ownerId === ownerId)
    .sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'primary' ? -1 : 1))
}

export function projectWallet(wallet: WalletRecord): Wallet {
  const { ownerId: _owner, ...rest } = wallet
  return rest
}
