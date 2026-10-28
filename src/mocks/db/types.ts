import type { EthAmount, Network } from '@/contracts/common'
import type { OrderStatus } from '@/contracts/order'
import type { Rarity } from '@/contracts/nft'
import type { WalletKind, WalletType } from '@/contracts/wallet'

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

export type CartItemRecord = {
  id: string
  nftId: string
  editionId: string
  quantity: number
  addedAt: string
}

export type CartRecord = {
  id: string
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
  favorites: Record<string, string[]>
  orders: OrderRecord[]
  wallets: WalletRecord[]
  quotes: QuoteRecord[]
  idempotency: IdempotencyRecord[]
  sequence: number
}
