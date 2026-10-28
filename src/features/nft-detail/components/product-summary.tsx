import { StarRating } from '@/components/nft/star-rating'
import type { EthAmount } from '@/contracts/common'
import type { NftDetail } from '@/contracts/nft'
import { formatEth } from '@/lib/money/eth'

type ProductSummaryProps = { nft: NftDetail; priceEth: EthAmount }

export function ProductSummary({ nft, priceEth }: ProductSummaryProps) {
  const { rating } = nft

  return (
    <div>
      <h1 className="text-cream mt-px text-[28px] leading-9 font-bold">{nft.name}</h1>
      <div className="mt-[9px] flex items-center justify-between gap-4">
        <p className="text-primary-light text-[22px] leading-7 font-bold">{formatEth(priceEth)}</p>
        <p className="text-cream flex items-center gap-1 text-[15px]">
          <StarRating average={rating.average} />
          <span>{rating.count} avaliações de colecionadores</span>
        </p>
      </div>
      <div aria-hidden="true" className="bg-primary/50 mt-[6px] h-px w-full max-w-[573px]" />
    </div>
  )
}
