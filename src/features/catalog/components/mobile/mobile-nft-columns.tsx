import type { NftSummary } from '@/contracts/nft'

import { MobileNftCard } from './mobile-nft-card'

const PRIORITY_COUNT = 4

export function MobileNftColumns({ items }: { items: NftSummary[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-5">
      {items.map((nft, index) => (
        <li key={nft.id} className="min-w-0">
          <MobileNftCard nft={nft} priority={index < PRIORITY_COUNT} />
        </li>
      ))}
    </ul>
  )
}
