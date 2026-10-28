import type { EthAmount, Network } from '@/contracts/common'
import type { OrderStatus } from '@/contracts/order'
import type { QuoteIssue } from '@/contracts/quote'
import type { WalletType } from '@/contracts/wallet'

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
  walletType: WalletType
  network: Network
  explorerUrl: string
  createdAt: string
  confirmedAt: string | null
  declinedReason: string | null
  settleAt: string
  plannedOutcome: 'confirmed' | 'declined'
  version: number
}

export type QuoteRecord = {
  id: string
  ownerId: string
  cartVersion: number
  lines: Array<{
    itemId: string
    nftId: string
    editionId: string
    quantity: number
    unitPriceEth: EthAmount
  }>
  subtotalEth: EthAmount
  discountEth: EthAmount
  networkFeeEth: EthAmount
  totalEth: EthAmount
  couponCode: string | null
  walletId: string
  network: Network
  issuedAt: string
  expiresAt: string
  issues: QuoteIssue[]
}

export type IdempotencyRecord = {
  key: string
  ownerId: string
  requestHash: string
  orderId: string
}
