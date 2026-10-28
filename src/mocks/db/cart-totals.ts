import { eth, type EthAmount, type Network } from '@/contracts/common'
import type { CartItem, CartTotals } from '@/contracts/cart'
import { addEth, minEth, percentOfEth, subtractEth } from '@/lib/money/eth'

import { NETWORK_FEES } from '../fixtures/users'
import { findCoupon, isCouponExpired } from './coupons'

export type AppliedCouponResult = { code: string; description: string; discountEth: EthAmount }

const ZERO = eth('0')

function networkFeeFor(networks: Set<Network>): EthAmount {
  return addEth(...[...networks].map((network) => eth(NETWORK_FEES[network])))
}

export function computeTotals(
  items: CartItem[],
  couponCode: string | null,
): { totals: CartTotals; coupon: AppliedCouponResult | null } {
  const subtotalEth = items.length ? addEth(...items.map((item) => item.subtotalEth)) : ZERO
  const networks = new Set(items.map((item) => item.network))
  const networkFeeEth = items.length ? networkFeeFor(networks) : ZERO

  let discountEth = ZERO
  let coupon: AppliedCouponResult | null = null

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
