import type { Order } from '@/contracts/order'
import { formatEth, isZeroEth } from '@/lib/money/eth'

function FeeRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="text-cream flex items-center justify-between pl-[169px] leading-6">
      <dt className={strong ? 'text-[15px] font-bold' : 'text-[15px]'}>{label}</dt>
      <dd className={strong ? 'text-primary-light text-lg/6 font-bold' : 'text-lg/6'}>{value}</dd>
    </div>
  )
}

export function OrderFees({ totals }: { totals: Order['totals'] }) {
  return (
    <dl className="mt-2.5 flex flex-col gap-1.5">
      {!isZeroEth(totals.discountEth) && (
        <FeeRow label="Desconto" value={`(-) ${formatEth(totals.discountEth)}`} />
      )}
      <FeeRow label="Taxa de rede" value={formatEth(totals.networkFeeEth)} />
      <FeeRow strong label="Total" value={formatEth(totals.totalEth)} />
    </dl>
  )
}
