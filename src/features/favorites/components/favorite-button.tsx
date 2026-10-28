import { Heart } from 'lucide-react'

import { cn } from '@/lib/utils'

import { useIsFavorite } from '../hooks/use-favorites'
import { useToggleFavorite } from '../hooks/use-toggle-favorite'

type FavoriteButtonProps = {
  nftId: string
  name: string
  initial?: boolean
  className?: string
}

export function FavoriteButton({ nftId, name, initial = false, className }: FavoriteButtonProps) {
  const isFavorite = useIsFavorite(nftId, initial)
  const { toggle } = useToggleFavorite()

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={isFavorite ? `Remover ${name} dos favoritos` : `Adicionar ${name} aos favoritos`}
      onClick={() => toggle({ nftId, isFavorite, name })}
      className={cn(
        'bg-card/90 text-cream hover:text-primary-light grid size-8 place-items-center rounded-full transition-colors',
        'focus-visible:ring-ring outline-none focus-visible:ring-2',
        className,
      )}
    >
      <Heart className={cn('size-4', isFavorite && 'fill-primary text-primary')} />
    </button>
  )
}
