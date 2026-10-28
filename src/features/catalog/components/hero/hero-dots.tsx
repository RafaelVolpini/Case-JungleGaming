import { cn } from '@/lib/utils'

type HeroDotsProps = {
  count: number
  active: number
  onSelect: (index: number) => void
  className?: string
  dotClassName?: string
}

export function HeroDots({ count, active, onSelect, className, dotClassName }: HeroDotsProps) {
  return (
    <div role="group" aria-label="Destaques" className={cn('flex gap-2', className)}>
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Destaque ${index + 1} de ${count}`}
          aria-current={index === active ? 'true' : undefined}
          onClick={() => onSelect(index)}
          className={cn(
            'focus-visible:ring-ring size-3 rounded-full outline-none transition-[background-color,box-shadow] duration-300 focus-visible:ring-2',
            index === active
              ? 'bg-primary shadow-primary/40 shadow-[0_0_0_3px]'
              : 'bg-primary/55 hover:bg-primary/80',
            dotClassName,
          )}
        />
      ))}
    </div>
  )
}
