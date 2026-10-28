import { useEffect, useState, type ComponentProps } from 'react'

import { NftImage } from '@/components/nft/nft-image'
import type { NftSummary } from '@/contracts/nft'
import { cn } from '@/lib/utils'

const PRELOAD_DELAY_MS = 2000

type HeroSlidesProps = ComponentProps<'div'> & {
  slides: NftSummary[]
  active: number
  sizes: string
}

export function HeroSlides({ slides, active, sizes, className, ...props }: HeroSlidesProps) {
  const [preloaded, setPreloaded] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setPreloaded(true), PRELOAD_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className={cn('relative isolate overflow-hidden', className)} {...props}>
      {slides.map((slide, index) =>
        preloaded || index === 0 || index === active ? (
          <NftImage
            key={slide.id}
            image={slide.image}
            priority={index === 0}
            sizes={sizes}
            aria-hidden={index !== active}
            className={cn(
              'absolute inset-0 size-full transition-opacity',
              index === active ? 'z-10 opacity-100 duration-700' : 'opacity-0 delay-700 duration-0',
            )}
          />
        ) : null,
      )}
    </div>
  )
}
