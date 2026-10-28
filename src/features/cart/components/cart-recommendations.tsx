import { NftCard } from '@/components/nft/nft-card'
import { CardCarousel } from '@/components/shared/card-carousel'
import { useRelatedNfts } from '@/features/catalog/hooks/use-catalog-queries'

const TITLE = 'Colecionadores também viram'

export function CartRecommendations({ slug }: { slug: string }) {
  const { data } = useRelatedNfts(slug)
  if (!data || data.length === 0) return null

  return (
    <section aria-labelledby="recommendations-title" className="mt-[80px]">
      <h2 id="recommendations-title" className="text-primary-light text-[17px] leading-7 font-bold">
        {TITLE}
      </h2>
      <div aria-hidden="true" className="bg-primary mt-[4.5px] h-px w-full" />
      <CardCarousel
        label={TITLE}
        className="mt-8"
        items={data}
        getKey={(nft) => nft.id}
        renderItem={(nft) => <NftCard nft={nft} compact />}
      />
    </section>
  )
}
