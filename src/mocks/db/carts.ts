import { findNftById } from './catalog'
import { getDb, nextVersion } from './store'
import type { CartRecord, NftRecord } from './types'

function availableFor(nft: NftRecord, editionId: string): number {
  return nft.editions.find((edition) => edition.id === editionId)?.available ?? 0
}

export function getOrCreateCart(ownerId: string | null, visitorId: string | null): CartRecord {
  const db = getDb()

  const existing = ownerId
    ? db.carts.find((cart) => cart.ownerId === ownerId)
    : db.carts.find((cart) => cart.id === visitorId && cart.ownerId === null)

  if (existing) return existing

  const cart: CartRecord = {
    id: ownerId ? `cart-${ownerId}` : (visitorId ?? `cart-${crypto.randomUUID()}`),
    ownerId,
    items: [],
    couponCode: null,
    updatedAt: new Date().toISOString(),
    version: nextVersion(),
  }
  db.carts.push(cart)
  return cart
}

export function mergeVisitorCart(visitorId: string | null, userId: string): CartRecord {
  const db = getDb()
  const target = getOrCreateCart(userId, null)
  if (!visitorId) return target

  const source = db.carts.find((cart) => cart.id === visitorId && cart.ownerId === null)
  if (!source) return target

  for (const item of source.items) {
    const nft = findNftById(item.nftId)
    if (!nft) continue
    const capacity = availableFor(nft, item.editionId)
    if (capacity === 0) continue

    const existing = target.items.find(
      (candidate) => candidate.nftId === item.nftId && candidate.editionId === item.editionId,
    )

    if (existing) {
      existing.quantity = Math.min(existing.quantity + item.quantity, capacity, nft.maxPerOrder)
    } else {
      target.items.push({
        ...item,
        id: `ci-${crypto.randomUUID()}`,
        quantity: Math.min(item.quantity, capacity, nft.maxPerOrder),
      })
    }
  }

  target.couponCode ??= source.couponCode
  target.updatedAt = new Date().toISOString()
  target.version = nextVersion()

  db.carts = db.carts.filter((cart) => cart.id !== source.id)
  return target
}

export function touchCart(cart: CartRecord): void {
  cart.updatedAt = new Date().toISOString()
  cart.version = nextVersion()
}
