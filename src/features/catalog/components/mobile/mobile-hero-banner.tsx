import { ArrowRight } from 'lucide-react'

import { ArtImage } from '@/components/nft/art-image'
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
    <section
      aria-labelledby="hero-title"
      {...focusProps}
      className="relative mt-4 h-[190px] overflow-hidden rounded-[20px] bg-[#2a1b12] bg-[radial-gradient(circle_98px_at_118px_98px,rgba(214,150,96,0.2)_0_99%,transparent_100%),radial-gradient(circle_135px_at_215px_130px,rgba(214,150,96,0.1)_0_99%,transparent_100%),radial-gradient(circle_at_26%_50%,#7c5434_0%,#5a3b22_30%,#3a2615_62%,#2a1b12_100%)]"
    >
      <div className="absolute top-1.5 left-4 w-[190px]">
        <p className="text-cream text-xs leading-4">{HERO_COPY_MOBILE.eyebrow}</p>
        <h1 id="hero-title" className="text-cream mt-[5.5px] text-lg leading-[29px] font-bold">
          {HERO_COPY_MOBILE.title}
        </h1>
        <p className="text-foreground mt-[7px] text-xs leading-[18px]">
          {HERO_COPY_MOBILE.description}
        </p>
      </div>
      <a
        href="#catalogo"
        className="text-primary-light focus-visible:ring-ring absolute top-[145px] left-4 flex items-center gap-[13px] rounded-sm text-sm leading-4 font-bold outline-none focus-visible:ring-2"
      >
        {HERO_COPY_MOBILE.action}
        <ArrowRight className="size-[18px]" aria-hidden="true" />
      </a>
      <HeroSlides
        slides={slides}
        active={active}
        sizes="138px"
        className="absolute top-[10.5px] right-4 size-[138px] rounded-[18px]"
        {...hoverProps}
      />
      <ArtImage
        art="sage"
        alt=""
        sizes="58px"
        className="absolute top-[98.5px] left-[226px] size-[58px] rounded-xl object-cover"
      />
      {slides.length > 1 && (
        <HeroDots
          count={slides.length}
          active={active}
          onSelect={select}
          dotClassName="size-[7px]"
          className="absolute bottom-[9px] left-1/2 -translate-x-1/2 gap-[17px]"
        />
      )}
    </section>
  )
}
