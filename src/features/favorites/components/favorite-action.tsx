import { Heart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { useIsFavorite } from '../hooks/use-favorites'
import { useToggleFavorite } from '../hooks/use-toggle-favorite'

type FavoriteActionProps = { nftId: string; name: string; initial?: boolean; className?: string }

export function FavoriteAction({ nftId, name, initial = false, className }: FavoriteActionProps) {
  const isFavorite = useIsFavorite(nftId, initial)
  const { toggle } = useToggleFavorite()

  return (
    <Button
      variant="outline"
      aria-pressed={isFavorite}
      onClick={() => toggle({ nftId, isFavorite, name })}
      className={cn('h-10 w-[130px] gap-2 rounded-md text-base font-normal', className)}
    >
      <Heart className={cn('size-6', isFavorite && 'fill-current')} aria-hidden="true" />
      Favoritar
    </Button>
  )
}
