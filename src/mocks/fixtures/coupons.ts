import { eth, type EthAmount } from '@/contracts/common'

/**
 * Deterministic coupon scenarios. `KURIO10` is the happy path; `EXPIRADO` and
 * `VENCIDO30` exercise the two rejection branches the challenge calls out.
 */
export type CouponFixture = {
  code: string
  description: string
  percentOff: number | null
  amountOffEth: EthAmount | null
  /** Null means it never expires. */
  expiresAt: string | null
}

export const COUPON_FIXTURES: CouponFixture[] = [
  {
    code: 'KURIO10',
    description: '10% de desconto',
    percentOff: 10,
    amountOffEth: null,
    expiresAt: null,
  },
  {
    code: 'PRIMEIRACUNHAGEM',
    description: '0.05 ETH de desconto',
    percentOff: null,
    amountOffEth: eth('0.05'),
    expiresAt: null,
  },
  {
    code: 'EXPIRADO',
    description: '20% de desconto',
    percentOff: 20,
    amountOffEth: null,
    expiresAt: '2025-01-01T00:00:00.000Z',
  },
  {
    code: 'VENCIDO30',
    description: '30% de desconto',
    percentOff: 30,
    amountOffEth: null,
    expiresAt: '2026-01-15T00:00:00.000Z',
  },
]
