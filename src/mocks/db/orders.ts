import type { Network } from '@/contracts/common'
import type { Order } from '@/contracts/order'
import { multiplyEth } from '@/lib/money/eth'

import { findNftById } from './catalog'
import { getOrCreateCart, touchCart } from './carts'
import { findCoupon } from './coupons'
import { imageFor } from './projections'
import { getDb, mutateWith, nextVersion, type DbEvent } from './store'
import type { OrderItemRecord, OrderRecord, QuoteRecord, WalletRecord } from './types'

export const SETTLE_DELAY_MS = 1500

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

export function findOrder(id: string): OrderRecord | undefined {
  return getDb().orders.find((order) => order.id === id)
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
  const id = `ord-${crypto.randomUUID().slice(0, 8)}`
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

function removePurchasedFromCart(order: OrderRecord): void {
  const cart = getOrCreateCart(order.ownerId, null)
  for (const item of order.items) {
    const line = cart.items.find(
      (candidate) => candidate.nftId === item.nftId && candidate.editionId === item.editionId,
    )
    if (line) line.quantity -= item.quantity
  }
  cart.items = cart.items.filter((line) => line.quantity > 0)
  if (cart.items.length === 0) cart.couponCode = null
  touchCart(cart)
}

function releaseStock(order: OrderRecord): DbEvent[] {
  const events: DbEvent[] = []
  for (const item of order.items) {
    const nft = findNftById(item.nftId)
    const edition = nft?.editions.find((candidate) => candidate.id === item.editionId)
    if (nft && edition) {
      edition.available += item.quantity
      nft.version = nextVersion()
      events.push({ type: 'nft.updated', nftId: nft.id })
    }
  }
  return events
}

export function settleOrder(orderId: string): DbEvent[] {
  const order = findOrder(orderId)
  if (!order || order.status !== 'pending') return []

  const events: DbEvent[] = []
  if (order.plannedOutcome === 'confirmed') {
    order.status = 'confirmed'
    order.confirmedAt = new Date().toISOString()
    removePurchasedFromCart(order)
  } else {
    order.status = 'declined'
    order.declinedReason = 'Pagamento recusado pela carteira.'
    events.push(...releaseStock(order))
  }
  order.version = nextVersion()
  events.push({ type: 'order.updated', orderId: order.id, ownerId: order.ownerId })
  return events
}

export function settleDueOrders(ownerId: string): DbEvent[] {
  const now = Date.now()
  return getDb()
    .orders.filter(
      (order) =>
        order.ownerId === ownerId &&
        order.status === 'pending' &&
        Date.parse(order.settleAt) <= now,
    )
    .flatMap((order) => settleOrder(order.id))
}

export function scheduleSettlement(orderId: string): void {
  setTimeout(() => {
    mutateWith(() => ({ result: undefined, events: settleOrder(orderId) }))
  }, SETTLE_DELAY_MS)
}

export function projectOrder(order: OrderRecord): Order {
  return {
    id: order.id,
    reference: order.reference,
    status: order.status,
    items: order.items.map((item) => ({
      nftId: item.nftId,
      nftSlug: item.nftSlug,
      name: item.name,
      tokenId: item.tokenId,
      image: { url: item.imageUrl, alt: item.imageAlt, width: 960, height: 960 },
      edition: {
        id: item.editionId,
        label: item.editionLabel,
        index: item.editionIndex,
        total: item.editionTotal,
      },
      quantity: item.quantity,
      unitPriceEth: item.unitPriceEth,
      subtotalEth: item.subtotalEth,
    })),
    totals: {
      subtotalEth: order.subtotalEth,
      discountEth: order.discountEth,
      networkFeeEth: order.networkFeeEth,
      totalEth: order.totalEth,
    },
    coupon:
      order.couponCode && order.couponDescription
        ? {
            code: order.couponCode,
            description: order.couponDescription,
            discountEth: order.discountEth,
          }
        : null,
    wallet: {
      id: order.walletId,
      label: order.walletLabel,
      address: order.walletAddress,
      network: order.network,
    },
    explorerUrl: order.explorerUrl,
    createdAt: order.createdAt,
    confirmedAt: order.confirmedAt,
    declinedReason: order.declinedReason,
    version: order.version,
  }
}
