import { lazy, Suspense, useState } from 'react'

import { NftImage } from '@/components/nft/nft-image'
import { BackButton } from '@/components/shared/back-button'
import { MOBILE_COVER_SIZES } from '@/lib/format/image'
import type { NftDetail } from '@/contracts/nft'
import { FavoriteButton } from '@/features/favorites/components/favorite-button'

import { pickDefaultEdition } from '../../lib/default-edition'
import { MobileBuyBar } from './mobile-buy-bar'
import { MobileDetailSheet } from './mobile-detail-sheet'

const DetailTabs = lazy(() =>
  import('../detail-tabs').then((module) => ({ default: module.DetailTabs })),
)
const RelatedNfts = lazy(() =>
  import('../related-nfts').then((module) => ({ default: module.RelatedNfts })),
)

export function MobileNftDetail({ nft }: { nft: NftDetail }) {
  const [editionId, setEditionId] = useState(() => pickDefaultEdition(nft.editions).id)
  const edition =
    nft.editions.find((item) => item.id === editionId) ?? pickDefaultEdition(nft.editions)
  const cover = nft.images[0]

  return (
    <div className="bg-card min-h-dvh pb-[190px]">
      <div className="flex items-center justify-between px-7 pt-[23px]">
        <BackButton />
        <FavoriteButton
          nftId={nft.id}
          name={nft.name}
          initial={nft.isFavorite}
          className="bg-surface-raised text-primary-light size-[35px]"
        />
      </div>
      {cover && (
        <div className="mt-2 ml-7 mr-[25px] aspect-[361/326] overflow-hidden rounded-t-[30px]">
          <NftImage
            image={cover}
            priority
            sizes={MOBILE_COVER_SIZES}
            className="aspect-square w-full"
          />
        </div>
      )}
      <MobileDetailSheet
        nft={nft}
        editions={nft.editions}
        editionId={edition.id}
        onEditionChange={setEditionId}
      />
      <div className="bg-card min-h-[600px] px-6">
        <Suspense fallback={null}>
          <DetailTabs nft={nft} />
          <RelatedNfts slug={nft.slug} />
        </Suspense>
      </div>
      <MobileBuyBar key={edition.id} nft={nft} edition={edition} />
    </div>
  )
}
