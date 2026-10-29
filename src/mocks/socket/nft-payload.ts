import type { findNftById } from '../db/catalog'
import { mockId } from '../db/ids'
import { totalAvailable } from '../db/projections'
import type { NftEventPayload } from './event-log'

type NftRecord = NonNullable<ReturnType<typeof findNftById>>

export function buildNftPayload(nft: NftRecord, at: string): NftEventPayload {
  return {
    eventId: mockId('evt'),
    resource: 'nft',
    id: nft.id,
    version: nft.version,
    priceEth: nft.priceEth,
    previousPriceEth: nft.previousPriceEth,
    available: totalAvailable(nft),
    editions: nft.editions.map((edition) => ({
      id: edition.id,
      available: edition.available,
      priceEth: edition.priceEth,
    })),
    at,
  }
}
