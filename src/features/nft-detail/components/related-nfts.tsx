import { NftCard } from '@/components/nft/nft-card'
import { CardCarousel } from '@/components/shared/card-carousel'
import { useRelatedNfts } from '@/features/catalog/hooks/use-catalog-queries'

type RelatedNftsProps = { slug: string; title?: string }

export function RelatedNfts({ slug, title = 'Mais desta coleção' }: RelatedNftsProps) {
  const { data } = useRelatedNfts(slug)

  if (!data || data.length === 0) return null

  return (
    <section aria-labelledby="related-title" className="mt-[91.5px]">
      <h2 id="related-title" className="text-primary-light text-[17px] leading-7 font-bold">
        {title}
      </h2>
      <div aria-hidden="true" className="bg-primary mt-[4.5px] h-px w-full" />
      <CardCarousel
        label={title}
        className="mt-8"
        items={data}
        getKey={(nft) => nft.id}
        renderItem={(nft) => <NftCard nft={nft} compact />}
      />
    </section>
  )
}
