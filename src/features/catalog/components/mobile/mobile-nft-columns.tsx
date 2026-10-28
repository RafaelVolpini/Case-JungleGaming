import type { NftSummary } from '@/contracts/nft'

import { MobileNftCard } from './mobile-nft-card'

const COLUMN = 'flex min-w-0 flex-1 flex-col gap-5'

export function MobileNftColumns({ items }: { items: NftSummary[] }) {
  const left = items.filter((_, index) => index % 2 === 0)
  const right = items.filter((_, index) => index % 2 === 1)

  return (
    <div className="flex gap-4">
      <ul className={COLUMN}>
        {left.map((nft, index) => (
          <li key={nft.id}>
            <MobileNftCard nft={nft} imageAlign="top" priority={index < 2} />
          </li>
        ))}
      </ul>
      <ul className={`${COLUMN} mt-8`}>
        {right.map((nft) => (
          <li key={nft.id}>
            <MobileNftCard nft={nft} imageAlign="bottom" />
          </li>
        ))}
      </ul>
    </div>
  )
}
