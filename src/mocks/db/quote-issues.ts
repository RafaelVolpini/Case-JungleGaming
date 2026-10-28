import type { CartItem } from '@/contracts/cart'
import type { QuoteIssue } from '@/contracts/quote'
import { compareEth, formatEth } from '@/lib/money/eth'

import { touchCart } from './carts'
import { findCoupon, isCouponExpired } from './coupons'
import type { CartRecord } from './records/commerce'
import type { QuoteRecord } from './types'

export function detectIssues(
  items: CartItem[],
  couponCode: string | null,
  previous: QuoteRecord | undefined,
): QuoteIssue[] {
  const issues: QuoteIssue[] = []

  for (const item of items) {
    const before = previous?.lines.find((line) => line.itemId === item.id)
    if (before && compareEth(before.unitPriceEth, item.unitPriceEth) !== 0) {
      issues.push({
        code: 'PRICE_CHANGED',
        itemId: item.id,
        message: `${item.name}: o preço mudou de ${formatEth(before.unitPriceEth)} para ${formatEth(item.unitPriceEth)}.`,
        previousEth: before.unitPriceEth,
        currentEth: item.unitPriceEth,
      })
    }
    if (item.availableQuantity === 0) {
      issues.push({
        code: 'SOLD_OUT',
        itemId: item.id,
        message: `${item.name} (edição ${item.edition.label}) esgotou.`,
        previousQuantity: item.quantity,
        currentQuantity: 0,
      })
    } else if (item.quantity > item.availableQuantity) {
      issues.push({
        code: 'AVAILABILITY_REDUCED',
        itemId: item.id,
        message: `${item.name}: restam apenas ${item.availableQuantity} unidades.`,
        previousQuantity: item.quantity,
        currentQuantity: item.availableQuantity,
      })
    }
  }

  if (couponCode) {
    const coupon = findCoupon(couponCode)
    if (!coupon) {
      issues.push({ code: 'COUPON_INVALID', message: `O cupom ${couponCode} não é mais válido.` })
    } else if (isCouponExpired(coupon)) {
      issues.push({ code: 'COUPON_EXPIRED', message: `O cupom ${couponCode} expirou.` })
    }
  }

  return issues
}

export function applyIssueFixes(cart: CartRecord, issues: QuoteIssue[]): void {
  for (const issue of issues) {
    const line = cart.items.find((candidate) => candidate.id === issue.itemId)
    if (issue.code === 'SOLD_OUT') cart.items = cart.items.filter((candidate) => candidate !== line)
    if (issue.code === 'AVAILABILITY_REDUCED' && line) line.quantity = issue.currentQuantity ?? 1
    if (issue.code === 'COUPON_EXPIRED' || issue.code === 'COUPON_INVALID') cart.couponCode = null
  }
  if (cart.items.length === 0) cart.couponCode = null
  touchCart(cart)
}
