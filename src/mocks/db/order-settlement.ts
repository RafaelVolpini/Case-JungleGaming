import { getDb, mutateWith, nextVersion, type DbEvent } from './store'
import { findNftById } from './catalog'
import { getOrCreateCart, touchCart } from './carts'
import type { OrderRecord } from './types'

export const SETTLE_DELAY_MS = 1500

export function findOrder(id: string): OrderRecord | undefined {
  return getDb().orders.find((order) => order.id === id)
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
