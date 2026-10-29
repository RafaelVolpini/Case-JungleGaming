import type { Network } from '@/contracts/common'
import { multiplyEth } from '@/lib/money/eth'

import { findNftById } from './catalog'
import { SETTLE_DELAY_MS } from './order-settlement'
import { findCoupon } from './coupons'
import { imageFor } from './projections'
import { getDb, nextVersion, type DbEvent } from './store'
import type { OrderItemRecord, OrderRecord, QuoteRecord, WalletRecord } from './types'
import { mockId } from './ids'

const EXPLORERS: Record<Network, string> = {
  ethereum: 'https://etherscan.io/tx/',
  polygon: 'https://polygonscan.com/tx/',
  solana: 'https://solscan.io/tx/',
}

function referenceFor(seed: string): string {
  let hash = 2166136261
  let hex = ''
  for (let round = 0; hex.length < 64; round++) {
    for (const char of `${seed}:${round}`) {
      hash ^= char.charCodeAt(0)
      hash = Math.imul(hash, 16777619) >>> 0
    }
    hex += hash.toString(16).padStart(8, '0')
  }
  return `0x${hex.slice(0, 64)}`
}

function snapshotItems(quote: QuoteRecord): OrderItemRecord[] {
  const items: OrderItemRecord[] = []
  for (const line of quote.lines) {
    const nft = findNftById(line.nftId)
    const edition = nft?.editions.find((candidate) => candidate.id === line.editionId)
    if (!nft || !edition) continue
    const image = imageFor(nft)
    items.push({
      nftId: nft.id,
      nftSlug: nft.slug,
      name: nft.name,
      tokenId: nft.tokenId,
      imageUrl: image.url,
      imageAlt: image.alt,
      editionId: edition.id,
      editionLabel: edition.label,
      editionIndex: edition.index,
      editionTotal: edition.total,
      quantity: line.quantity,
      unitPriceEth: line.unitPriceEth,
      subtotalEth: multiplyEth(line.unitPriceEth, line.quantity),
    })
  }
  return items
}

type CreateOrderInput = {
  quote: QuoteRecord
  wallet: WalletRecord
  outcome: 'confirmed' | 'declined'
}

export function createOrder({ quote, wallet, outcome }: CreateOrderInput) {
  const db = getDb()
  const id = mockId('ord')
  const reference = referenceFor(id)
  const now = new Date()
  const coupon = quote.couponCode ? findCoupon(quote.couponCode) : undefined
  const events: DbEvent[] = []

  const items = snapshotItems(quote).map((item) => {
    const quantity = item.quantity
    const nft = findNftById(item.nftId)
    const edition = nft?.editions.find((candidate) => candidate.id === item.editionId)
    if (nft && edition) {
      edition.available -= quantity
      nft.version = nextVersion()
      events.push({ type: 'nft.updated', nftId: nft.id })
    }
    return item
  })

  const order: OrderRecord = {
    id,
    ownerId: quote.ownerId,
    reference,
    status: 'pending',
    items,
    subtotalEth: quote.subtotalEth,
    discountEth: quote.discountEth,
    networkFeeEth: quote.networkFeeEth,
    totalEth: quote.totalEth,
    couponCode: quote.couponCode,
    couponDescription: coupon?.description ?? null,
    walletId: wallet.id,
    walletLabel: wallet.label,
    walletAddress: wallet.address,
    walletType: wallet.walletType,
    network: quote.network,
    explorerUrl: `${EXPLORERS[quote.network]}${reference}`,
    createdAt: now.toISOString(),
    confirmedAt: null,
    declinedReason: null,
    settleAt: new Date(now.getTime() + SETTLE_DELAY_MS).toISOString(),
    plannedOutcome: outcome,
    version: nextVersion(),
  }

  db.orders.push(order)
  events.push({ type: 'order.updated', orderId: order.id, ownerId: order.ownerId })
  return { order, events }
}
