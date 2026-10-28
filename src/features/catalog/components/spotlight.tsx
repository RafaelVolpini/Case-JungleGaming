import { Link } from '@tanstack/react-router'

import { NftImage } from '@/components/nft/nft-image'
import { Skeleton } from '@/components/ui/skeleton'
import { SPOTLIGHT_COPY } from '@/content/home'

import { useFeatured } from '../hooks/use-catalog-queries'

export function Spotlight() {
  const { data } = useFeatured()
  const nft = data?.spotlight

  return (
    <section aria-labelledby="spotlight-title">
      <div className="bg-[#271a11] px-5 pt-6 pb-4">
        <h2 id="spotlight-title" className="text-primary-light text-2xl leading-8 font-bold">
          {SPOTLIGHT_COPY.title}
        </h2>
        <p className="text-cream mt-3 text-center text-[22px] leading-7 font-bold">
          {SPOTLIGHT_COPY.subtitle}
        </p>
      </div>
      {nft ? (
        <Link
          to="/nft/$slug"
          params={{ slug: nft.slug }}
          className="focus-visible:ring-ring block rounded-2xl outline-none focus-visible:ring-2"
        >
          <span className="sr-only">Ver {nft.name}</span>
          <NftImage
            image={nft.image}
            sizes="310px"
            className="aspect-[310/358] rounded-2xl object-cover"
          />
        </Link>
      ) : (
        <Skeleton className="aspect-[310/358] w-full rounded-2xl" />
      )}
    </section>
  )
}
