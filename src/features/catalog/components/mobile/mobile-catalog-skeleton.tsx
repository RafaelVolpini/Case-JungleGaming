import { CATALOG_PER_PAGE } from '@/contracts/nft'

import { MobileNftCardSkeleton } from './mobile-nft-card-skeleton'

export function MobileCatalogSkeleton() {
  return (
    <ul
      className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5"
      aria-busy="true"
      aria-label="Carregando NFTs"
    >
      {Array.from({ length: CATALOG_PER_PAGE }, (_, index) => (
        <li key={index} className="min-w-0">
          <MobileNftCardSkeleton />
        </li>
      ))}
    </ul>
  )
}
