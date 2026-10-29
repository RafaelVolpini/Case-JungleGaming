import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import type { CreateOrderInput } from '@/contracts/order'
import { useSession } from '@/features/auth/hooks/use-session'
import { ApiRequestError } from '@/lib/http/errors'
import { getIdempotencyKey } from '@/lib/idempotency'
import { queryKeys } from '@/lib/query/keys'

import {
  beginPlacingOrder,
  endPlacingOrder,
  writePendingOrderId,
} from '@/features/orders/lib/pending-order'

import { createOrderRequest } from '../api/checkout-api'
import { clearOrderAttempt, resolveOrderInput, writeOrderAttempt } from '../lib/order-attempt'

export function usePlaceOrder() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { scope } = useSession()

  return useMutation({
    onMutate: beginPlacingOrder,
    onSettled: endPlacingOrder,

    mutationFn: (input: CreateOrderInput) => {
      const effective = resolveOrderInput(scope, input)
      return createOrderRequest(effective, getIdempotencyKey(`order:${effective.quoteId}`))
    },

    onSuccess: (order) => {
      clearOrderAttempt(scope)
      writePendingOrderId(scope, order.id)
      queryClient.setQueryData(queryKeys.orders.detail(scope, order.id), order)
      void navigate({ to: '/pedido/$orderId', params: { orderId: order.id } })
    },

    onError: (error, input) => {
      const effective = resolveOrderInput(scope, input)
      if (error instanceof ApiRequestError && error.isTransient) {
        writeOrderAttempt(scope, { input: effective })
      }
      if ((error as { code?: string }).code === 'QUOTE_STALE') {
        clearOrderAttempt(scope)
        void queryClient.invalidateQueries({ queryKey: queryKeys.quote(scope) })
      }
    },
  })
}
