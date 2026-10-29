import type { QueryClient } from '@tanstack/react-query'
import { toast } from '@/lib/toast'

import type { OrderUpdatedEvent } from '@/contracts/events'
import type { Order } from '@/contracts/order'
import { clearPendingOrderId } from '@/features/orders/lib/pending-order'
import { queryKeys } from '@/lib/query/keys'

type OrderContext = {
  queryClient: QueryClient
  scope: string
  openOrder: (orderId: string) => void
}

function viewingOrder(orderId: string): boolean {
  return window.location.pathname.endsWith(`/pedido/${orderId}`)
}

export function applyOrderUpdated(
  { queryClient, scope, openOrder }: OrderContext,
  event: OrderUpdatedEvent,
) {
  const detailKey = queryKeys.orders.detail(scope, event.id)
  const cached = queryClient.getQueryData<Order>(detailKey)
  if (cached && cached.status !== 'pending') return

  queryClient.setQueryData<Order>(detailKey, (order) =>
    order && event.version > order.version
      ? {
          ...order,
          status: event.status,
          confirmedAt: event.confirmedAt,
          declinedReason: event.declinedReason,
          version: event.version,
        }
      : order,
  )
  void queryClient.invalidateQueries({ queryKey: detailKey })

  if (event.status === 'pending') return

  clearPendingOrderId(scope)
  void queryClient.invalidateQueries({ queryKey: queryKeys.cart(scope) })
  void queryClient.invalidateQueries({ queryKey: ['catalog', scope] })
  if (viewingOrder(event.id)) return

  const action = { label: 'Ver recibo', onClick: () => openOrder(event.id) }
  if (event.status === 'confirmed') toast.success('Seu pedido foi confirmado.', { action })
  else toast.error(event.declinedReason ?? 'Seu pedido foi recusado.', { action })
}
