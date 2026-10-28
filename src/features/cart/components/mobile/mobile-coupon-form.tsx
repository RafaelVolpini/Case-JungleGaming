import { X } from 'lucide-react'
import { useId } from 'react'

import type { AppliedCoupon } from '@/contracts/cart'
import { formatEth } from '@/lib/money/eth'

import { useCouponForm } from '../../hooks/use-coupon-form'

export function MobileCouponForm({ coupon }: { coupon: AppliedCoupon | null }) {
  const inputId = useId()
  const errorId = useId()
  const { code, setCode, error, submit, applying, removeCoupon } = useCouponForm()

  return (
    <div>
      <form
        onSubmit={submit}
        className="border-input focus-within:border-primary flex h-[50px] items-center rounded-full border"
      >
        <label htmlFor={inputId} className="sr-only">
          Código promocional
        </label>
        <input
          id={inputId}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Digite o código promocional..."
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="placeholder:text-placeholder text-cream min-w-0 flex-1 bg-transparent pl-4 text-[13px] outline-none"
        />
        <button
          type="submit"
          disabled={applying}
          className="text-cream focus-visible:ring-ring -mr-px h-[50px] w-[97px] rounded-full bg-gradient-to-r from-[#8d5c39] to-[#c98a50] text-base font-bold shadow-[0_4px_12px_rgba(0,0,0,0.3)] outline-none focus-visible:ring-2 disabled:opacity-60"
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
        <p className="text-primary-light mt-2 flex items-center gap-2 text-xs">
          <span>
            Cupom <strong>{coupon.code}</strong> ({formatEth(coupon.discountEth)})
          </span>
          <button
            type="button"
            aria-label={`Remover cupom ${coupon.code}`}
            onClick={() => removeCoupon()}
            className="focus-visible:ring-ring rounded outline-none focus-visible:ring-2"
          >
            <X className="size-4" />
          </button>
        </p>
      )}
    </div>
  )
}
