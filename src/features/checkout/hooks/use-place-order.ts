import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import type { CreateOrderInput } from '@/contracts/order'
import { useSession } from '@/features/auth/hooks/use-session'
import { getIdempotencyKey } from '@/lib/idempotency'
import { queryKeys } from '@/lib/query/keys'

import { writePendingOrderId } from '@/features/orders/lib/pending-order'

import { createOrderRequest } from '../api/checkout-api'

export function usePlaceOrder() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { scope } = useSession()

  return useMutation({
    mutationFn: (input: CreateOrderInput) =>
      createOrderRequest(input, getIdempotencyKey(`order:${input.quoteId}`)),

    onSuccess: (order) => {
      writePendingOrderId(scope, order.id)
      queryClient.setQueryData(queryKeys.orders.detail(scope, order.id), order)
      void navigate({ to: '/pedido/$orderId', params: { orderId: order.id } })
    },

    onError: (error) => {
      if ((error as { code?: string }).code === 'QUOTE_STALE') {
        void queryClient.invalidateQueries({ queryKey: queryKeys.quote(scope) })
      }
    },
  })
}
