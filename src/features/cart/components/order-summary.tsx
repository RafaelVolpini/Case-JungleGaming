import { Link, useNavigate } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import type { Cart } from '@/contracts/cart'
import { useSession } from '@/features/auth/hooks/use-session'
import { formatEth, isZeroEth } from '@/lib/money/eth'

import { CouponForm } from './coupon-form'

const labelClassName = 'text-cream text-[15px] leading-6'
const valueClassName = 'text-cream text-lg leading-6'

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className={labelClassName}>{label}</dt>
      <dd className={valueClassName}>{value}</dd>
    </div>
  )
}

export function OrderSummary({ cart }: { cart: Cart }) {
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
    <aside aria-label="Resumo da carteira">
      <h2 className="text-cream border-primary/40 border-b pb-[7px] text-lg leading-6 font-bold">
        Resumo da carteira
      </h2>
      <div className="mt-5">
        <CouponForm coupon={cart.coupon} />
      </div>
      <dl className="mt-5 flex flex-col gap-[10px]">
        <Line label="Subtotal" value={formatEth(totals.subtotalEth)} />
        <Line label="Desconto do lançamento" value={`(-) ${discount}`} />
        <Line label="Taxa de rede" value={formatEth(totals.networkFeeEth)} />
      </dl>
      <p className="text-primary-light mt-2 text-right text-xs leading-4">Taxa estimada</p>
      <div className="mt-[20.5px] flex items-center justify-between gap-4">
        <p className="text-cream text-lg leading-6 font-bold">Total</p>
        <p
          className="text-primary-light text-lg leading-6 font-bold"
          aria-live="polite"
          data-testid="cart-total"
        >
          {formatEth(totals.totalEth)}
        </p>
      </div>
      {blocked && (
        <p role="alert" className="text-destructive mt-3 text-sm">
          Há itens esgotados no carrinho. Remova-os para continuar.
        </p>
      )}
      <Button
        className="mt-6 h-10 w-full rounded-md text-base"
        disabled={blocked}
        onClick={checkout}
      >
        Conectar e finalizar
      </Button>
      <Link
        to="/"
        hash="catalogo"
        className="text-foreground hover:text-primary-light mt-4 block text-center text-[15px] underline underline-offset-4 transition-colors"
      >
        Continuar explorando
      </Link>
    </aside>
  )
}
