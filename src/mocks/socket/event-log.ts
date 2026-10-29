export type NftEventPayload = {
  eventId: string
  resource: 'nft'
  id: string
  version: number
  priceEth: string
  previousPriceEth: string | null
  available: number
  editions: Array<{ id: string; available: number; priceEth: string }>
  at: string
}

type NftEventHistory = { latest: NftEventPayload; earlier: NftEventPayload | null }

const history = new Map<string, NftEventHistory>()

export function rememberNftEvent(payload: NftEventPayload): void {
  const known = history.get(payload.id)
  history.set(payload.id, { latest: payload, earlier: known?.latest ?? null })
}

export function nftEventHistory(nftId: string): NftEventHistory | undefined {
  return history.get(nftId)
}

export function forgetNftEvents(): void {
  history.clear()
}
