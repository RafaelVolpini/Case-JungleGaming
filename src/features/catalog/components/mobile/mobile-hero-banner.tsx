import { ArrowRight } from 'lucide-react'

import { HERO_COPY_MOBILE } from '@/content/home'

import { useFeatured } from '../../hooks/use-catalog-queries'
import { useHeroRotation } from '../../hooks/use-hero-rotation'
import { HeroDots } from '../hero/hero-dots'
import { HeroSlides } from '../hero/hero-slides'

export function MobileHeroBanner() {
  const { data } = useFeatured()
  const slides = data?.hero ?? []
  const { active, select, hoverProps, focusProps } = useHeroRotation(slides.length)

  return (
    <div className="@container mt-4 [--u:min(1px,0.2924cqw)]">
      <section
        aria-labelledby="hero-title"
        {...focusProps}
        className="relative h-[calc(190*var(--u))] overflow-hidden rounded-[20px] bg-[#2a1b12] bg-[radial-gradient(circle_98px_at_118px_98px,rgba(214,150,96,0.2)_0_99%,transparent_100%),radial-gradient(circle_135px_at_215px_130px,rgba(214,150,96,0.1)_0_99%,transparent_100%),radial-gradient(circle_at_26%_50%,#7c5434_0%,#5a3b22_30%,#3a2615_62%,#2a1b12_100%)]"
      >
        <div className="absolute top-[calc(6*var(--u))] left-[calc(16*var(--u))] w-[calc(170*var(--u))]">
          <p className="text-cream text-[length:calc(12*var(--u))] leading-[calc(16*var(--u))]">
            {HERO_COPY_MOBILE.eyebrow}
          </p>
          <h1
            id="hero-title"
            className="text-cream mt-[calc(5.5*var(--u))] text-[length:calc(18*var(--u))] leading-[calc(29*var(--u))] font-bold"
          >
            {HERO_COPY_MOBILE.title}
          </h1>
          <p className="text-foreground mt-[calc(7*var(--u))] max-w-[24.5ch] [text-rendering:geometricPrecision] text-[length:calc(11*var(--u))] leading-[calc(16*var(--u))]">
            {HERO_COPY_MOBILE.description}
          </p>
        </div>
        <a
          href="#catalogo"
          className="text-primary-light focus-visible:ring-ring absolute top-[calc(145*var(--u))] left-[calc(16*var(--u))] flex items-center gap-[calc(13*var(--u))] rounded-sm text-[length:calc(14*var(--u))] leading-[calc(16*var(--u))] font-bold outline-none focus-visible:ring-2"
        >
          {HERO_COPY_MOBILE.action}
          <ArrowRight className="size-[calc(18*var(--u))]" aria-hidden="true" />
        </a>
        <HeroSlides
          slides={slides}
          active={active}
          sizes="138px"
          className="absolute top-[calc(10.5*var(--u))] right-[calc(16*var(--u))] size-[calc(138*var(--u))] rounded-[calc(18*var(--u))]"
          {...hoverProps}
        />
        {slides.length > 1 && (
          <HeroDots
            count={slides.length}
            active={active}
            onSelect={select}
            dotClassName="size-[calc(7*var(--u))]"
            className="absolute bottom-[calc(9*var(--u))] left-1/2 -translate-x-1/2 gap-[calc(17*var(--u))]"
          />
        )}
      </section>
    </div>
  )
}
