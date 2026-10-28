import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

import { NotFoundContent } from '@/components/feedback/not-found-screen'
import { ErrorState } from '@/components/feedback/error-state'
import { useSession } from '@/features/auth/hooks/use-session'
import { ApiRequestError } from '@/lib/http/errors'
import { queryKeys } from '@/lib/query/keys'

import { OrderDetails } from '../components/order-details'
import { OrderModal } from '../components/order-modal'
import { OrderSkeleton } from '../components/order-skeleton'
import { useOrder } from '../hooks/use-order'
import { orderTitle } from '../lib/order-title'
import { clearPendingOrderId } from '../lib/pending-order'

export function OrderPage({ orderId }: { orderId: string }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { scope } = useSession()
  const { data: order, error, refetch } = useOrder(orderId)
  const status = order?.status

  useEffect(() => {
    if (!status || status === 'pending') return
    clearPendingOrderId(scope)
    void queryClient.invalidateQueries({ queryKey: queryKeys.cart(scope) })
  }, [status, scope, queryClient])

  if (error instanceof ApiRequestError && error.status === 404) return <NotFoundContent />

  const close = () => void navigate({ to: '/' })

  return (
    <OrderModal title={status ? orderTitle(status) : 'Pedido'} onClose={close}>
      {order ? (
        <OrderDetails order={order} />
      ) : error ? (
        <div className="p-6">
          <ErrorState
            error={error}
            onRetry={() => void refetch()}
            title="Não foi possível carregar o pedido"
          />
        </div>
      ) : (
        <OrderSkeleton />
      )}
    </OrderModal>
  )
}
