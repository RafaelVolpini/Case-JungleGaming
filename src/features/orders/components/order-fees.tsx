import type { Order } from '@/contracts/order'
import { formatEth, isZeroEth } from '@/lib/money/eth'

function FeeRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="text-cream flex items-center justify-between leading-6 md:grid md:grid-cols-[1fr_115px] md:gap-x-6">
      <dt className={strong ? 'text-[15px] font-bold md:text-right' : 'text-[15px] md:text-right'}>
        {label}
      </dt>
      <dd
        className={
          strong
            ? 'text-primary-light text-lg/6 font-bold md:pr-1 md:text-right'
            : 'text-lg/6 md:pr-1 md:text-right'
        }
      >
        {value}
      </dd>
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
