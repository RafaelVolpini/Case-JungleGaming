import { createFileRoute } from '@tanstack/react-router'

import { OrderPage } from '@/features/orders/pages/order-page'

export const Route = createFileRoute('/_shell/_authed/pedido/$orderId')({
  component: OrderRoute,
})

function OrderRoute() {
  const { orderId } = Route.useParams()
  return <OrderPage orderId={orderId} />
}
