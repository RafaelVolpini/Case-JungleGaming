import type { Edition, NftDetail } from '@/contracts/nft'
import { formatTokenId } from '@/lib/format/token'

import { mobileSummary } from '../../lib/mobile-summary'
import { EditionPicker } from '../edition-picker'
import { RatingPill } from './rating-pill'

type MobileDetailSheetProps = {
  nft: NftDetail
  editionId: string
  onEditionChange: (editionId: string) => void
  editions: Edition[]
}

export function MobileDetailSheet({
  nft,
  editionId,
  onEditionChange,
  editions,
}: MobileDetailSheetProps) {
  const selected = editions.find((edition) => edition.id === editionId) ?? editions[0]

  return (
    <section
      aria-labelledby="nft-title"
      className="bg-card relative -mt-[2px] rounded-t-[32px] px-6 pt-[33px] pb-8 shadow-[0_-10px_24px_rgba(0,0,0,0.22)]"
    >
      <div className="flex items-center justify-between gap-3">
        <h1 id="nft-title" className="text-cream truncate text-xl leading-7 font-bold">
          {nft.name}
        </h1>
        <RatingPill average={nft.rating.average} count={nft.rating.count} />
      </div>
      <p className="text-foreground mt-3 text-sm leading-6">{mobileSummary(nft, selected)}</p>
      <h2 className="text-cream mt-[9px] text-[15px] leading-6 font-bold">Edição:</h2>
      <div className="mt-1">
        <EditionPicker
          editions={editions}
          value={editionId}
          onChange={onEditionChange}
          itemClassName="text-foreground h-[25px] px-2 text-sm"
        />
      </div>
      <dl className="text-placeholder mt-3 flex flex-col gap-2 text-[15px] leading-6">
        <div>
          <dt className="inline">ID do token: </dt>
          <dd className="inline">{formatTokenId(nft.tokenId)}</dd>
        </div>
        <div>
          <dt className="inline">Coleção: </dt>
          <dd className="inline">{nft.series}</dd>
        </div>
        <div>
          <dt className="inline">Atributos: </dt>
          <dd className="inline">
            {nft.attributes.map((attribute) => attribute.value).join(', ')}
          </dd>
        </div>
      </dl>
    </section>
  )
}
