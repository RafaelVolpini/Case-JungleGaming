import { useState } from 'react'

import { NftImage } from '@/components/nft/nft-image'
import { BackButton } from '@/components/shared/back-button'
import type { NftDetail } from '@/contracts/nft'
import { FavoriteButton } from '@/features/favorites/components/favorite-button'

import { pickDefaultEdition } from '../../lib/default-edition'
import { DetailTabs } from '../detail-tabs'
import { RelatedNfts } from '../related-nfts'
import { MobileBuyBar } from './mobile-buy-bar'
import { MobileDetailSheet } from './mobile-detail-sheet'

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
        <div className="mx-7 mt-2 h-[326px] overflow-hidden rounded-t-[30px]">
          <NftImage image={cover} priority sizes="361px" className="size-[361px]" />
        </div>
      )}
      <MobileDetailSheet
        nft={nft}
        editions={nft.editions}
        editionId={edition.id}
        onEditionChange={setEditionId}
      />
      <div className="bg-card px-6">
        <DetailTabs nft={nft} />
        <RelatedNfts slug={nft.slug} />
      </div>
      <MobileBuyBar key={edition.id} nft={nft} edition={edition} />
    </div>
  )
}
