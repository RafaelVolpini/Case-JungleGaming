import type { EthAmount } from '@/contracts/common'
import { addEth, percentOfEth, roundEth, subtractEth } from '@/lib/money/eth'

export const PRICE_STEPS = [-10, -5, 5, 10] as const
export type PriceStep = (typeof PRICE_STEPS)[number]

const PRICE_DECIMALS = 2

export function stepLabel(step: PriceStep): string {
  return step > 0 ? `+${step}%` : `${step}%`
}

export function stepPrice(price: EthAmount, step: PriceStep): EthAmount {
  const delta = percentOfEth(price, Math.abs(step))
  const next = step > 0 ? addEth(price, delta) : subtractEth(price, delta)
  return roundEth(next, PRICE_DECIMALS)
}
