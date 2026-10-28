import type { EthAmount } from '@/contracts/common'
import { formatEth } from '@/lib/money/eth'
import { cn } from '@/lib/utils'

type NftPriceProps = {
  priceEth: EthAmount
  previousPriceEth?: EthAmount | null
  className?: string
}

export function NftPrice({ priceEth, previousPriceEth, className }: NftPriceProps) {
  return (
    <p className={cn('text-primary-light font-bold', className)}>
      <span>{formatEth(priceEth)}</span>
      {previousPriceEth && (
        <span className="text-muted-foreground ml-2 font-normal">
          <span className="sr-only">Preço anterior: </span>
          {formatEth(previousPriceEth)}
        </span>
      )}
    </p>
  )
}
