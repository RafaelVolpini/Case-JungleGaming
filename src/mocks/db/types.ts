import type { CollectionRecord, NftRecord } from './records/catalog'
import type { SessionRecord, UserRecord, WalletRecord } from './records/account'
import type { CartRecord, IdempotencyRecord, OrderRecord, QuoteRecord } from './records/commerce'

export type * from './records/catalog'
export type * from './records/account'
export type * from './records/commerce'

export type MockDb = {
  schemaVersion: number
  collections: CollectionRecord[]
  nfts: NftRecord[]
  users: UserRecord[]
  sessions: SessionRecord[]
  carts: CartRecord[]
  favorites: Record<string, string[]>
  orders: OrderRecord[]
  wallets: WalletRecord[]
  quotes: QuoteRecord[]
  idempotency: IdempotencyRecord[]
  sequence: number
}
