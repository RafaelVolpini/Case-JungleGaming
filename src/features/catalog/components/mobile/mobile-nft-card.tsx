import { Link } from '@tanstack/react-router'

import { NftImage } from '@/components/nft/nft-image'
import { NftPrice } from '@/components/nft/nft-price'
import type { NftSummary } from '@/contracts/nft'
import { FavoriteButton } from '@/features/favorites/components/favorite-button'
import { cn } from '@/lib/utils'

type MobileNftCardProps = {
  nft: NftSummary
  imageAlign: 'top' | 'bottom'
  priority?: boolean
}

export function MobileNftCard({ nft, imageAlign, priority = false }: MobileNftCardProps) {
  const soldOut = nft.available === 0

  return (
    <article className="group relative">
      <Link
        to="/nft/$slug"
        params={{ slug: nft.slug }}
        className="focus-visible:ring-ring block rounded-[20px] outline-none focus-visible:ring-2"
      >
        <div
          className={cn(
            'bg-card relative rounded-[20px] px-1',
            imageAlign === 'top' ? 'pt-3 pb-5' : 'pt-5 pb-3',
          )}
        >
          <NftImage
            image={nft.image}
            priority={priority}
            sizes="168px"
            className="aspect-square w-full rounded-2xl"
          />
          {nft.rarity === 'rare' && nft.previousPriceEth !== null && (
            <span className="bg-primary text-primary-foreground absolute top-4 left-0 flex h-8 w-[68px] items-center px-2 text-xs leading-4 uppercase">
              Raro
            </span>
          )}
          {soldOut && (
            <span className="bg-background/80 text-cream absolute right-3 bottom-3 rounded-md px-2 py-1 text-xs">
              Esgotado
            </span>
          )}
        </div>
        <div className="mt-[7px] px-2">
          <h3 className="text-cream truncate text-[15px] leading-[22px]">{nft.name}</h3>
          <NftPrice
            priceEth={nft.priceEth}
            previousPriceEth={nft.previousPriceEth}
            className="-mt-[5px] text-base leading-6"
          />
        </div>
      </Link>
      <FavoriteButton
        nftId={nft.id}
        name={nft.name}
        initial={nft.isFavorite}
        className="bg-background/90 text-primary absolute top-3 right-2.5 size-7"
      />
    </article>
  )
}
