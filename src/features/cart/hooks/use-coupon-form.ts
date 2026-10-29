import { useState, type FormEvent } from 'react'
import { toast } from '@/lib/toast'

import { ApiRequestError, errorMessage } from '@/lib/http/errors'

import { useCartMutations } from './use-cart-mutations'

export function useCouponForm() {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { applyCode, removeCode } = useCartMutations()

  function submit(event: FormEvent) {
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

  function removeCoupon() {
    removeCode.mutate(undefined, {
      onSuccess: () => toast.success('Cupom removido.'),
      onError: (failure) => toast.error(errorMessage(failure)),
    })
  }

  return {
    code,
    setCode,
    error,
    submit,
    applying: applyCode.isPending,
    removeCoupon,
  }
}
