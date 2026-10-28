import { cn } from '@/lib/utils'

type HeroDotsProps = {
  count: number
  active: number
  onSelect: (index: number) => void
  className?: string
}

export function HeroDots({ count, active, onSelect, className }: HeroDotsProps) {
  return (
    <div role="group" aria-label="Destaques" className={cn('flex gap-2', className)}>
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Destaque ${index + 1} de ${count}`}
          aria-current={index === active}
          onClick={() => onSelect(index)}
          className={cn(
            'bg-primary focus-visible:ring-ring size-2 rounded-full outline-none focus-visible:ring-2',
          )}
        />
      ))}
    </div>
  )
}
