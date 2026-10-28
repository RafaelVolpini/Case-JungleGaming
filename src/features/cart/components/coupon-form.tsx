import { X } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import type { AppliedCoupon } from '@/contracts/cart'
import { ApiRequestError, errorMessage } from '@/lib/http/errors'
import { formatEth } from '@/lib/money/eth'

import { useCartMutations } from '../hooks/use-cart-mutations'

export function CouponForm({ coupon }: { coupon: AppliedCoupon | null }) {
  const inputId = useId()
  const errorId = useId()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { applyCode, removeCode } = useCartMutations()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    applyCode.mutate(
      { code },
      {
        onSuccess: (cart) => {
          setCode('')
          toast.success(`Cupom ${cart.coupon?.code ?? ''} aplicado.`)
        },
        onError: (failure) => {
          setError(
            failure instanceof ApiRequestError
              ? (failure.fields['code'] ?? failure.message)
              : errorMessage(failure),
          )
        },
      },
    )
  }

  return (
    <div>
      <label htmlFor={inputId} className="text-cream block text-[15px] leading-6 font-bold">
        Código promocional
      </label>
      <form onSubmit={handleSubmit} className="mt-1 flex h-10">
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
          disabled={applyCode.isPending}
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
            onClick={() => removeCode.mutate()}
            className="hover:text-cream focus-visible:ring-ring rounded outline-none focus-visible:ring-2"
          >
            <X className="size-4" />
          </button>
        </p>
      )}
    </div>
  )
}
