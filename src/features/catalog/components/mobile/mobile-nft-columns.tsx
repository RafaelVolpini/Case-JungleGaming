import { useDeferredValue } from 'react'

import type { NftSummary } from '@/contracts/nft'

import { MobileNftCard } from './mobile-nft-card'

const PRIORITY_COUNT = 4

export function MobileNftColumns({ items }: { items: NftSummary[] }) {
  const visible = useDeferredValue(items, items.slice(0, PRIORITY_COUNT))

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-5">
      {visible.map((nft, index) => (
        <li key={nft.id} className="min-w-0">
          <MobileNftCard nft={nft} priority={index < PRIORITY_COUNT} />
        </li>
      ))}
    </ul>
  )
}
