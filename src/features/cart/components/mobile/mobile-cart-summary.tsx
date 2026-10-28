import { useNavigate } from '@tanstack/react-router'

import type { Cart } from '@/contracts/cart'
import { useSession } from '@/features/auth/hooks/use-session'
import { formatEth, isZeroEth } from '@/lib/money/eth'

import { MobileCouponForm } from './mobile-coupon-form'

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-end justify-between">
      <dt className="text-cream text-[15px] leading-6">{label}</dt>
      <dd className="text-cream text-base leading-6">{value}</dd>
    </div>
  )
}

export function MobileCartSummary({ cart }: { cart: Cart }) {
  const { isAuthenticated } = useSession()
  const navigate = useNavigate()
  const { totals } = cart
  const blocked = cart.items.some((item) => item.maxQuantity === 0)
  const discount = isZeroEth(totals.discountEth) ? '00.00' : formatEth(totals.discountEth)

  function checkout() {
    if (isAuthenticated) void navigate({ to: '/pagamento' })
    else void navigate({ to: '/entrar', search: { redirect: '/pagamento' } })
  }

  return (
    <aside
      aria-label="Resumo da carteira"
      className="bg-card fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[640px] rounded-t-[36px] px-6 pt-6 pb-9 shadow-[0_-10px_24px_rgba(0,0,0,0.35)]"
    >
      <MobileCouponForm coupon={cart.coupon} />
      <dl className="mt-[9px] flex flex-col gap-[8.5px]">
        <Line label="Subtotal" value={formatEth(totals.subtotalEth)} />
        <Line label="Desconto do lançamento" value={`(-) ${discount}`} />
        <Line label="Taxa de rede" value={formatEth(totals.networkFeeEth)} />
      </dl>
      <p className="text-primary-light -mt-1 text-right text-xs leading-4">Taxa estimada</p>
      <div className="mt-[10px] flex items-center justify-between">
        <p className="text-cream text-[17px] leading-6 font-bold">Total</p>
        <p
          className="text-primary-light text-lg leading-6 font-bold"
          aria-live="polite"
          data-testid="cart-total"
        >
          {formatEth(totals.totalEth)}
        </p>
      </div>
      {blocked && (
        <p role="alert" className="text-destructive mt-2 text-xs">
          Há itens esgotados no carrinho. Remova-os para continuar.
        </p>
      )}
      <button
        type="button"
        onClick={checkout}
        disabled={blocked}
        className="text-background focus-visible:ring-ring mt-6 h-[60px] w-full rounded-full bg-gradient-to-br from-[#cc874b] to-[#b47845] text-base font-bold outline-none focus-visible:ring-2 disabled:opacity-50"
      >
        Conectar e finalizar
      </button>
    </aside>
  )
}
