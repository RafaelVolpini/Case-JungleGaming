import { useState } from 'react'

import type { NftDetail } from '@/contracts/nft'

import { pickDefaultEdition } from '../lib/default-edition'

import { DetailTabs } from './detail-tabs'
import { EditionPicker } from './edition-picker'
import { NftGallery } from './nft-gallery'
import { NftMetadata } from './nft-metadata'
import { ProductSummary } from './product-summary'
import { PurchaseActions } from './purchase-actions'
import { RelatedNfts } from './related-nfts'

export function NftDetailContent({ nft }: { nft: NftDetail }) {
  const [editionId, setEditionId] = useState(() => pickDefaultEdition(nft.editions).id)
  const edition =
    nft.editions.find((item) => item.id === editionId) ?? pickDefaultEdition(nft.editions)

  return (
    <>
      <div className="mt-2 md:grid md:grid-cols-[572px_1fr] md:gap-x-[33px]">
        <NftGallery images={nft.images} name={nft.name} />
        <div className="mt-6 md:mt-0">
          <ProductSummary nft={nft} priceEth={edition.priceEth} />
          <h2 className="text-cream mt-[9px] text-base leading-6 font-bold">Sobre este NFT:</h2>
          <p className="text-foreground mt-2 text-sm leading-6">{nft.description}</p>
          <h2 className="text-cream mt-1 text-base leading-6 font-bold">Edição:</h2>
          <div className="mt-2">
            <EditionPicker editions={nft.editions} value={edition.id} onChange={setEditionId} />
          </div>
          <div className="mt-[13px]">
            <PurchaseActions key={edition.id} nft={nft} edition={edition} />
          </div>
          <NftMetadata nft={nft} />
        </div>
      </div>
      <div className="mt-[86px]">
        <DetailTabs nft={nft} />
      </div>
      <RelatedNfts slug={nft.slug} />
    </>
  )
}
