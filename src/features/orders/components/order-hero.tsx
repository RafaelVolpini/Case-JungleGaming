import { CircleX, Loader2 } from 'lucide-react'

import { ThankYouEnvelope } from '@/components/icons/thank-you-envelope'
import type { OrderStatus } from '@/contracts/order'

import { orderTitle } from '../lib/order-title'

function StatusIcon({ status }: { status: OrderStatus }) {
  if (status === 'confirmed') return <ThankYouEnvelope className="text-primary h-[82px] w-[65px]" />
  if (status === 'pending') {
    return (
      <Loader2
        className="text-primary size-14 motion-safe:animate-spin"
        strokeWidth={1.5}
        aria-hidden="true"
      />
    )
  }
  return <CircleX className="text-destructive size-14" strokeWidth={1.5} aria-hidden="true" />
}

export function OrderHero({ status }: { status: OrderStatus }) {
  return (
    <header className="border-primary flex flex-col items-center border-b px-6 pt-[19.5px] pb-[18px]">
      <div className="grid h-[82px] place-items-center">
        <StatusIcon status={status} />
      </div>
      <h1
        aria-live="polite"
        className="text-foreground mt-[11.5px] text-center text-base leading-6 font-bold"
      >
        {orderTitle(status)}
      </h1>
    </header>
  )
}
