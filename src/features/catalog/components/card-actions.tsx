import { Link } from '@tanstack/react-router'
import { ZoomIn } from 'lucide-react'

import type { NftSummary } from '@/contracts/nft'
import { FavoriteButton } from '@/features/favorites/components/favorite-button'

export function CardActions({ nft }: { nft: NftSummary }) {
  return (
    <div className="absolute top-8 right-2 flex flex-col gap-2 transition-opacity max-md:top-3 max-md:right-3 md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
      <FavoriteButton nftId={nft.id} name={nft.name} initial={nft.isFavorite} />
      <Link
        to="/nft/$slug"
        params={{ slug: nft.slug }}
        aria-label={`Ver detalhes de ${nft.name}`}
        className="bg-card/90 text-cream hover:text-primary-light focus-visible:ring-ring grid size-8 place-items-center rounded-full outline-none focus-visible:ring-2 max-md:hidden"
      >
        <ZoomIn className="size-4" />
      </Link>
    </div>
  )
}
