import type { Order } from '@/contracts/order'
import { WALLET_TYPE_LABELS } from '@/contracts/wallet'
import { shortAddress } from '@/lib/format/address'
import { formatShortDate } from '@/lib/format/date'
import { formatEth } from '@/lib/money/eth'
import { cn } from '@/lib/utils'

type CellProps = { label: string; value: string; strong?: boolean; className?: string }

function Cell({ label, value, strong, className }: CellProps) {
  return (
    <div className={cn('text-foreground relative px-[17px] text-sm leading-[19px]', className)}>
      <dt className={strong ? 'font-bold' : undefined}>{label}</dt>
      <dd className="text-[15px]">{value}</dd>
    </div>
  )
}

const DIVIDER =
  "before:bg-primary before:absolute before:top-[3.5px] before:left-0 before:h-8 before:w-px before:content-['']"

export function OrderSummaryStrip({ order }: { order: Order }) {
  const date = order.confirmedAt ?? order.createdAt

  return (
    <dl className="border-primary grid h-[66px] grid-cols-2 border-b pt-[13px] md:grid-cols-[181px_144px_126px_1fr]">
      <Cell
        strong
        label="ID da transação"
        value={shortAddress(order.reference, '…')}
        className="md:pl-9"
      />
      <Cell label="Data" value={formatShortDate(date)} className={DIVIDER} />
      <Cell label="Total" value={formatEth(order.totals.totalEth)} className={DIVIDER} />
      <Cell
        strong
        label="Carteira"
        value={WALLET_TYPE_LABELS[order.wallet.walletType]}
        className={DIVIDER}
      />
    </dl>
  )
}
