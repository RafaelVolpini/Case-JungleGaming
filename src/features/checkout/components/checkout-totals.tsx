import { Link } from '@tanstack/react-router'

import type { Quote } from '@/contracts/quote'
import { formatEth, isZeroEth } from '@/lib/money/eth'

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-cream text-base leading-6">{label}</dt>
      <dd className="text-cream text-lg leading-6">{value}</dd>
    </div>
  )
}

export function CheckoutTotals({ totals }: { totals: Quote['totals'] }) {
  const discount = isZeroEth(totals.discountEth) ? '00.00' : formatEth(totals.discountEth)

  return (
    <div>
      <p className="text-cream mt-2 text-center text-sm leading-6">
        Tem um código promocional?{' '}
        <Link
          to="/carrinho"
          className="hover:text-primary-light focus-visible:ring-ring rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2"
        >
          Aplique aqui
        </Link>
      </p>
      <dl className="mt-1.5 flex flex-col gap-2">
        <Line label="Subtotal" value={formatEth(totals.subtotalEth)} />
        <Line label="Desconto do lançamento" value={`(-) ${discount}`} />
        <Line label="Taxa de rede" value={formatEth(totals.networkFeeEth)} />
      </dl>
      <p className="text-primary-light mt-2.5 text-center text-xs leading-4">Taxa estimada</p>
      <div className="border-primary/40 mt-3 border-t pt-2">
        <div className="flex items-center justify-between gap-4 px-[42px]">
          <p className="text-cream text-lg leading-6 font-bold">Total</p>
          <p
            className="text-primary-light text-lg leading-6 font-bold"
            data-testid="checkout-total"
          >
            {formatEth(totals.totalEth)}
          </p>
        </div>
      </div>
    </div>
  )
}
