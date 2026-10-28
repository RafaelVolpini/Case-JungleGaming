import { X } from 'lucide-react'
import { useId } from 'react'

import type { AppliedCoupon } from '@/contracts/cart'
import { formatEth } from '@/lib/money/eth'

import { useCouponForm } from '../hooks/use-coupon-form'

export function CouponForm({ coupon }: { coupon: AppliedCoupon | null }) {
  const inputId = useId()
  const errorId = useId()
  const { code, setCode, error, submit, applying, removeCoupon } = useCouponForm()

  return (
    <div>
      <label htmlFor={inputId} className="text-cream block text-[15px] leading-6 font-bold">
        Código promocional
      </label>
      <form onSubmit={submit} className="mt-1 flex h-10">
        <input
          id={inputId}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Digite o código promocional..."
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="border-primary text-foreground placeholder:text-foreground/70 focus-visible:ring-primary min-w-0 flex-1 rounded-l-[5px] border bg-transparent px-2 text-xs outline-none focus-visible:ring-1 aria-invalid:border-destructive"
        />
        <button
          type="submit"
          disabled={applying}
          className="bg-primary text-primary-foreground hover:bg-primary-hover w-[101px] rounded-r-[5px] text-base font-bold transition-colors disabled:opacity-60"
        >
          Aplicar
        </button>
      </form>
      {error && (
        <p id={errorId} role="alert" className="text-destructive mt-2 text-xs">
          {error}
        </p>
      )}
      {coupon && (
        <p className="text-primary-light mt-3 flex items-center gap-2 text-sm">
          <span>
            Cupom <strong>{coupon.code}</strong>: {coupon.description} (
            {formatEth(coupon.discountEth)})
          </span>
          <button
            type="button"
            aria-label={`Remover cupom ${coupon.code}`}
            onClick={() => removeCoupon()}
            className="hover:text-cream focus-visible:ring-ring rounded outline-none focus-visible:ring-2"
          >
            <X className="size-4" />
          </button>
        </p>
      )}
    </div>
  )
}
