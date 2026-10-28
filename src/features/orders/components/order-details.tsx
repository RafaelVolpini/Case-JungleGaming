import type { Order } from '@/contracts/order'

import { OrderFees } from './order-fees'
import { OrderFooter } from './order-footer'
import { OrderHero } from './order-hero'
import { OrderItemsTable } from './order-items-table'
import { OrderSummaryStrip } from './order-summary-strip'

export function OrderDetails({ order }: { order: Order }) {
  return (
    <>
      <OrderHero status={order.status} />
      <OrderSummaryStrip order={order} />
      <section aria-labelledby="order-details-title" className="px-6 pt-[16.5px] pb-12 md:px-11">
        <h2
          id="order-details-title"
          className="text-cream mb-[3.5px] text-[15px] leading-6 font-bold"
        >
          Detalhes da transação
        </h2>
        <OrderItemsTable items={order.items} />
        <OrderFees totals={order.totals} />
        <OrderFooter order={order} />
      </section>
    </>
  )
}
