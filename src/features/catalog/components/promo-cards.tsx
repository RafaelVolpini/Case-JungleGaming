import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { ArtImage } from '@/components/nft/art-image'
import { buttonVariants } from '@/components/ui/button'
import { PROMO_CARDS } from '@/content/home'

import { catalogSearch } from '../search'

export function PromoCards() {
  return (
    <section
      aria-label="Destaques da Kurio"
      className="page-container mt-24 grid gap-[30px] lg:grid-cols-2"
    >
      {PROMO_CARDS.map((card) => (
        <article
          key={card.title}
          className="bg-card grid min-h-[250px] grid-cols-[minmax(0,286px)_1fr] overflow-hidden rounded-xl"
        >
          <ArtImage
            art={card.art}
            alt={card.alt}
            sizes="286px"
            className="h-full min-h-[250px] w-full rounded-[20px] object-cover"
          />
          <div className="flex flex-col items-end py-7 pr-6 pl-4 text-right">
            <h3 className="text-cream text-[17px] leading-6 font-bold whitespace-pre-line">
              {card.title}
            </h3>
            <p className="text-foreground mt-2 max-w-[259px] text-sm leading-6">
              {card.description}
            </p>
            <div className="mt-auto pt-4">
              <Link
                to="/"
                search={catalogSearch(card.search)}
                hash="catalogo"
                className={buttonVariants({
                  className: 'h-10 w-[140px] rounded-lg text-base',
                })}
              >
                Explorar
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}
