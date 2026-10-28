import type { NftDetail, NftSummary } from '@/contracts/nft'
import type { NftUpdatedEvent } from '@/contracts/events'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNft(value: unknown): value is NftSummary {
  return isRecord(value) && typeof value['id'] === 'string' && typeof value['version'] === 'number'
}

function patchNft(nft: NftSummary | NftDetail, event: NftUpdatedEvent): NftSummary | NftDetail {
  if (nft.id !== event.id || event.version <= nft.version) return nft

  const patched = {
    ...nft,
    priceEth: event.priceEth,
    previousPriceEth: event.previousPriceEth,
    available: event.available,
    version: event.version,
  }
  if (!('editions' in patched)) return patched

  return {
    ...patched,
    editions: patched.editions.map((edition) => {
      const update = event.editions.find((candidate) => candidate.id === edition.id)
      return update
        ? { ...edition, available: update.available, priceEth: update.priceEth }
        : edition
    }),
  }
}

export function patchNftData(data: unknown, event: NftUpdatedEvent): unknown {
  if (Array.isArray(data)) return data.map((entry) => patchNftData(entry, event))
  if (!isRecord(data)) return data

  if (isNft(data)) return patchNft(data as NftSummary | NftDetail, event)

  const entries = Object.entries(data).map(([key, value]) => [key, patchNftData(value, event)])
  return Object.fromEntries(entries)
}
