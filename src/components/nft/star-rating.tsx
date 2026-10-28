import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'

type StarRatingProps = { average: number; className?: string }

export function StarRating({ average, className }: StarRatingProps) {
  const full = Math.floor(average)

  return (
    <span
      role="img"
      aria-label={`Nota ${average.toFixed(1)} de 5`}
      className={cn('flex gap-1', className)}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={cn(
            'size-3',
            index < full ? 'fill-primary text-primary' : 'fill-foreground text-foreground',
          )}
          strokeWidth={0}
        />
      ))}
    </span>
  )
}
