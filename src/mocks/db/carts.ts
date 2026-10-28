import { eth, type EthAmount, type Network } from '@/contracts/common'
import type { Cart, CartItem, CartTotals } from '@/contracts/cart'
import { addEth, minEth, multiplyEth, percentOfEth, subtractEth } from '@/lib/money/eth'

import { COUPON_FIXTURES, type CouponFixture } from '../fixtures/coupons'
import { NETWORK_FEES } from '../fixtures/users'
import { findNftById } from './catalog'
import { imageFor } from './projections'
import { getDb, nextVersion } from './store'
import type { CartRecord, NftRecord } from './types'

const ZERO = eth('0')

export function findCoupon(code: string): CouponFixture | undefined {
  return COUPON_FIXTURES.find(
    (coupon) => coupon.code.toLowerCase() === code.trim().toLowerCase(),
  )
}

export function isCouponExpired(coupon: CouponFixture, now = new Date()): boolean {
  return coupon.expiresAt !== null && new Date(coupon.expiresAt) <= now
}

function networkFeeFor(networks: Set<Network>): EthAmount {
  return addEth(...[...networks].map((network) => eth(NETWORK_FEES[network])))
}

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
      (candidate) =>
        candidate.nftId === item.nftId && candidate.editionId === item.editionId,
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

export function projectCartItems(cart: CartRecord): CartItem[] {
  const items: CartItem[] = []

  for (const line of cart.items) {
    const nft = findNftById(line.nftId)
    if (!nft) continue
    const edition = nft.editions.find((candidate) => candidate.id === line.editionId)
    if (!edition) continue

    items.push({
      id: line.id,
      nftId: nft.id,
      nftSlug: nft.slug,
      name: nft.name,
      tokenId: nft.tokenId,
      image: imageFor(nft),
      network: nft.network,
      edition: {
        id: edition.id,
        label: edition.label,
        index: edition.index,
        total: edition.total,
      },
      quantity: line.quantity,
      unitPriceEth: edition.priceEth,
      subtotalEth: multiplyEth(edition.priceEth, line.quantity),
      availableQuantity: edition.available,
    })
  }

  return items
}

export function computeTotals(
  items: CartItem[],
  couponCode: string | null,
): { totals: CartTotals; coupon: { code: string; description: string; discountEth: EthAmount } | null } {
  const subtotalEth = items.length ? addEth(...items.map((item) => item.subtotalEth)) : ZERO
  const networks = new Set(items.map((item) => item.network))
  const networkFeeEth = items.length ? networkFeeFor(networks) : ZERO

  let discountEth = ZERO
  let coupon: { code: string; description: string; discountEth: EthAmount } | null = null

  const found = couponCode ? findCoupon(couponCode) : undefined
  if (found && !isCouponExpired(found) && items.length > 0) {
    const raw = found.percentOff
      ? percentOfEth(subtotalEth, found.percentOff)
      : (found.amountOffEth ?? ZERO)
    discountEth = minEth(raw, subtotalEth)
    coupon = { code: found.code, description: found.description, discountEth }
  }

  const totalEth = addEth(subtractEth(subtotalEth, discountEth), networkFeeEth)

  return {
    totals: { subtotalEth, discountEth, networkFeeEth, totalEth },
    coupon,
  }
}

export function projectCart(cart: CartRecord): Cart {
  const items = projectCartItems(cart)
  const { totals, coupon } = computeTotals(items, cart.couponCode)

  return {
    id: cart.id,
    items,
    coupon,
    totals,
    updatedAt: cart.updatedAt,
    version: cart.version,
  }
}

export function touchCart(cart: CartRecord): void {
  cart.updatedAt = new Date().toISOString()
  cart.version = nextVersion()
}
