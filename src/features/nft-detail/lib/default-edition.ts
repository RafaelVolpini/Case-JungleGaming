import type { Edition } from '@/contracts/nft'

const DEFAULT_EDITION_LABEL = '1/50'

export function pickDefaultEdition(editions: Edition[]): Edition {
  return (
    editions.find((edition) => edition.label === DEFAULT_EDITION_LABEL && edition.available > 0) ??
    editions.find((edition) => edition.available > 0) ??
    editions[0]!
  )
}
