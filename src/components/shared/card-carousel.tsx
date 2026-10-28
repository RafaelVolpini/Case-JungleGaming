import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

type CardCarouselProps<T> = {
  items: T[]
  getKey: (item: T) => string
  renderItem: (item: T) => ReactNode
  label: string
  className?: string
}

export function CardCarousel<T>({
  items,
  getKey,
  renderItem,
  label,
  className,
}: CardCarouselProps<T>) {
  const [viewportRef, api] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 'auto',
    containScroll: 'trimSnaps',
  })
  const [selected, setSelected] = useState(0)
  const [snaps, setSnaps] = useState<number[]>([])

  const sync = useCallback(() => {
    if (!api) return
    setSnaps(api.scrollSnapList())
    setSelected(api.selectedScrollSnap())
  }, [api])

  useEffect(() => {
    if (!api) return
    sync()
    api.on('select', sync).on('reInit', sync)
    return () => {
      api.off('select', sync).off('reInit', sync)
    }
  }, [api, sync])

  return (
    <div role="region" aria-roledescription="carrossel" aria-label={label} className={className}>
      <div ref={viewportRef} className="overflow-hidden">
        <ul className="-ml-[26px] flex">
          {items.map((item) => (
            <li
              key={getKey(item)}
              className="min-w-0 shrink-0 basis-[45%] pl-[26px] md:basis-[25%] lg:basis-[20%]"
            >
              {renderItem(item)}
            </li>
          ))}
        </ul>
      </div>
      {snaps.length > 1 && (
        <div
          className="mt-[33px] flex justify-center gap-2"
          role="group"
          aria-label="Páginas do carrossel"
        >
          {snaps.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Ir para a página ${index + 1}`}
              aria-current={index === selected}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                'size-3 rounded-full border transition-colors outline-none focus-visible:ring-ring focus-visible:ring-2',
                index === selected ? 'bg-primary border-primary' : 'border-primary',
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
