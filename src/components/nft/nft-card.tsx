import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import type { NftSummary } from '@/contracts/nft'
import { cn } from '@/lib/utils'

import { NftImage } from './nft-image'
import { NftPrice } from './nft-price'

type NftCardProps = {
  nft: NftSummary
  actions?: ReactNode
  priority?: boolean
  compact?: boolean
  className?: string
}

export function NftCard({
  nft,
  actions,
  priority = false,
  compact = false,
  className,
}: NftCardProps) {
  const soldOut = nft.available === 0

  return (
    <article className={cn('group relative', className)}>
      <Link
        to="/nft/$slug"
        params={{ slug: nft.slug }}
        className="focus-visible:ring-ring block outline-none focus-visible:ring-2"
      >
        <div
          className={cn(
            'bg-card relative px-1 max-md:rounded-2xl max-md:p-1',
            compact ? 'py-[22px]' : 'py-[25px]',
          )}
        >
          <NftImage image={nft.image} priority={priority} className="rounded-[14px]" />
          {nft.rarity === 'rare' && (
            <Badge className="absolute top-0 left-0 rounded-none rounded-br-md px-4 py-2 text-xs md:hidden">
              Raro
            </Badge>
          )}
          {soldOut && (
            <Badge
              variant="wallet"
              className="bg-background/80 absolute right-3 bottom-8 max-md:right-3 max-md:bottom-3"
            >
              Esgotado
            </Badge>
          )}
        </div>
        <div className="mt-[8.5px] max-md:mt-3 max-md:px-2">
          <h3
            className={cn(
              'text-cream truncate max-md:text-xs',
              compact ? 'text-sm' : 'text-[15px]',
              'leading-[22px]',
            )}
          >
            {nft.name}
          </h3>
          <NftPrice
            priceEth={nft.priceEth}
            previousPriceEth={nft.previousPriceEth}
            className={cn(
              compact ? '-mt-[2.5px] text-sm' : 'mt-[5.5px] text-lg',
              'leading-6 max-md:text-sm',
            )}
          />
        </div>
      </Link>
      {actions}
    </article>
  )
}
