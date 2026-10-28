import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { NftImage } from '@/components/nft/nft-image'
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import { HERO_COPY } from '@/content/home'

import { useFeatured } from '../../hooks/use-catalog-queries'
import { HeroDots } from './hero-dots'

export function HeroSection() {
  const { data } = useFeatured()
  const [active, setActive] = useState(0)
  const slides = data?.hero ?? []
  const current = slides[active]

  return (
    <section
      aria-labelledby="hero-title"
      className="page-container relative mt-8 grid gap-8 lg:grid-cols-[1fr_450px] lg:gap-0"
    >
      <div className="pt-[39px] lg:pl-10">
        <p className="text-cream text-sm leading-6 tracking-[0.1em]">{HERO_COPY.eyebrow}</p>
        <h1
          id="hero-title"
          className="text-cream mt-[5px] max-w-[560px] text-[43px] leading-[70px] font-bold"
        >
          {HERO_COPY.title}
        </h1>
        <p className="text-foreground mt-[3px] max-w-[560px] text-sm leading-6">
          {HERO_COPY.description}
        </p>
        <Link
          to="/"
          hash="catalogo"
          className={buttonVariants({
            size: 'md',
            className: 'mt-8 h-10 w-[140px] rounded-lg text-base',
          })}
        >
          {HERO_COPY.action}
        </Link>
      </div>

      {current ? (
        <Link
          to="/nft/$slug"
          params={{ slug: current.slug }}
          className="focus-visible:ring-ring block rounded-[20px] outline-none focus-visible:ring-2"
        >
          <NftImage image={current.image} priority sizes="450px" className="rounded-[20px]" />
        </Link>
      ) : (
        <Skeleton className="aspect-square w-full rounded-[20px]" />
      )}

      {slides.length > 1 && (
        <HeroDots
          count={slides.length}
          active={active}
          onSelect={setActive}
          className="lg:absolute lg:top-[399px] lg:left-[600px]"
        />
      )}
    </section>
  )
}
