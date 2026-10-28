import type { Cart, CartItem } from '@/contracts/cart'
import { multiplyEth } from '@/lib/money/eth'

import { findNftById } from './catalog'
import { computeTotals } from './cart-totals'
import { imageFor } from './projections'
import type { CartRecord } from './types'

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
