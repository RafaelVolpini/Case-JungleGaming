import { Star } from 'lucide-react'

type RatingPillProps = { average: number; count: number }

export function RatingPill({ average, count }: RatingPillProps) {
  return (
    <p
      aria-label={`Nota ${average.toFixed(1)} de 5, ${count} avaliações`}
      className="border-primary text-cream flex h-[27px] shrink-0 items-center gap-1 rounded-full border px-2 text-sm"
    >
      <Star className="size-4 fill-[#e3a44e] text-[#e3a44e]" aria-hidden="true" />
      <span className="font-bold">{average.toFixed(1)}</span>
      <span className="text-foreground -ml-1">({count})</span>
    </p>
  )
}
