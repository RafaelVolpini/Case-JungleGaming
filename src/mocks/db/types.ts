import type { EthAmount, Network } from '@/contracts/common'
import type { OrderStatus } from '@/contracts/order'
import type { Rarity } from '@/contracts/nft'
import type { WalletKind, WalletType } from '@/contracts/wallet'

/**
 * Internal records of the simulated backend. They are deliberately NOT the API
 * shapes: records hold what the server owns (password hashes, ownership, raw
 * references), and the handlers project them into contract shapes on the way
 * out. Keeping the two apart is what lets the cart recompute prices on read.
 */

export type EditionRecord = {
  id: string
  label: string
  index: number
  total: number
  available: number
  priceEth: EthAmount
}

export type NftRecord = {
  id: string
  slug: string
  name: string
  tokenId: string
  description: string
  collectionId: string
  network: Network
  priceEth: EthAmount
  previousPriceEth: EthAmount | null
  rarity: Rarity
  editions: EditionRecord[]
  attributes: Array<{ trait: string; value: string }>
  rating: { average: number; count: number }
  contractAddress: string
  copyright: string
  maxPerOrder: number
  listedAt: string
  favoritesCount: number
  version: number
}

export type CollectionRecord = {
  id: string
  slug: string
  name: string
}

export type UserRecord = {
  id: string
  displayName: string
  username: string
  email: string
  /** SHA-256 of `salt:password`. The plaintext never reaches the store. */
  passwordHash: string
  passwordSalt: string
  ensName: string | null
  avatarEmoji: string
  createdAt: string
}

export type SessionRecord = {
  token: string
  userId: string
  expiresAt: string
}

/**
 * A cart line references the NFT and edition; it never copies the price.
 * Prices are read from the NFT when the cart is projected, so a `nft.updated`
 * event is reflected in the cart with no synchronisation code at all.
 */
export type CartItemRecord = {
  id: string
  nftId: string
  editionId: string
  quantity: number
  addedAt: string
}

export type CartRecord = {
  id: string
  /** Null for a visitor cart; set once the cart is merged into an account. */
  ownerId: string | null
  items: CartItemRecord[]
  couponCode: string | null
  updatedAt: string
  version: number
}

export type OrderItemRecord = {
  nftId: string
  nftSlug: string
  name: string
  tokenId: string
  imageUrl: string
  imageAlt: string
  editionId: string
  editionLabel: string
  editionIndex: number
  editionTotal: number
  quantity: number
  /** Frozen at creation — the receipt must not follow the catalog. */
  unitPriceEth: EthAmount
  subtotalEth: EthAmount
}

export type OrderRecord = {
  id: string
  ownerId: string
  reference: string
  status: OrderStatus
  items: OrderItemRecord[]
  subtotalEth: EthAmount
  discountEth: EthAmount
  networkFeeEth: EthAmount
  totalEth: EthAmount
  couponCode: string | null
  couponDescription: string | null
  walletId: string
  walletLabel: string
  walletAddress: string
  network: Network
  explorerUrl: string
  createdAt: string
  confirmedAt: string | null
  declinedReason: string | null
  version: number
}

export type WalletRecord = {
  id: string
  ownerId: string
  kind: WalletKind
  label: string
  address: string
  network: Network
  walletType: WalletType
  ensName: string | null
  profileName: string | null
  referralCode: string | null
  createdAt: string
}

export type QuoteRecord = {
  id: string
  ownerId: string
  cartVersion: number
  /** Snapshot of unit prices at issue time, used to detect drift on submit. */
  lines: Array<{ itemId: string; nftId: string; editionId: string; quantity: number; unitPriceEth: EthAmount }>
  subtotalEth: EthAmount
  discountEth: EthAmount
  networkFeeEth: EthAmount
  totalEth: EthAmount
  couponCode: string | null
  walletId: string
  network: Network
  issuedAt: string
  expiresAt: string
}

/**
 * Idempotency ledger for order creation. `requestHash` is what makes replaying
 * the same key with a different body a conflict rather than a silent overwrite.
 */
export type IdempotencyRecord = {
  key: string
  ownerId: string
  requestHash: string
  orderId: string
}

export type MockDb = {
  schemaVersion: number
  collections: CollectionRecord[]
  nfts: NftRecord[]
  users: UserRecord[]
  sessions: SessionRecord[]
  carts: CartRecord[]
  /** userId -> NFT ids. Visitors cannot favourite. */
  favorites: Record<string, string[]>
  orders: OrderRecord[]
  wallets: WalletRecord[]
  quotes: QuoteRecord[]
  idempotency: IdempotencyRecord[]
  /** Monotonic counter backing every record's `version`. */
  sequence: number
}
