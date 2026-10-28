import Big from 'big.js'

import { ethAmountSchema, type EthAmount } from '@/contracts/common'

Big.NE = -21
Big.PE = 40
Big.DP = 18
Big.RM = Big.roundDown

function toBig(amount: EthAmount): Big {
  return new Big(amount)
}

function fromBig(value: Big): EthAmount {
  return ethAmountSchema.parse(value.toFixed())
}

export function addEth(...amounts: EthAmount[]): EthAmount {
  return fromBig(amounts.reduce<Big>((sum, a) => sum.plus(toBig(a)), new Big(0)))
}

export function subtractEth(minuend: EthAmount, subtrahend: EthAmount): EthAmount {
  const result = toBig(minuend).minus(toBig(subtrahend))
  return fromBig(result.lt(0) ? new Big(0) : result)
}

export function multiplyEth(amount: EthAmount, quantity: number): EthAmount {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new RangeError(`Quantidade deve ser inteiro não-negativo, recebido: ${quantity}`)
  }
  return fromBig(toBig(amount).times(quantity))
}

export function percentOfEth(amount: EthAmount, percent: number): EthAmount {
  return fromBig(toBig(amount).times(percent).div(100))
}

export function compareEth(a: EthAmount, b: EthAmount): -1 | 0 | 1 {
  return toBig(a).cmp(toBig(b)) as -1 | 0 | 1
}

export function isZeroEth(amount: EthAmount): boolean {
  return toBig(amount).eq(0)
}

export function minEth(a: EthAmount, b: EthAmount): EthAmount {
  return compareEth(a, b) <= 0 ? a : b
}

export function formatEth(
  amount: EthAmount,
  { unit = true, maxDecimals = 4 }: { unit?: boolean; maxDecimals?: number } = {},
): string {
  const rounded = toBig(amount).round(maxDecimals, Big.roundHalfUp)
  const [whole = '0', fraction = ''] = rounded.toFixed().split('.')
  const trimmed = fraction.replace(/0+$/, '')
  const padded = trimmed.length < 2 ? trimmed.padEnd(2, '0') : trimmed
  const value = `${whole}.${padded}`
  return unit ? `${value} ETH` : value
}
