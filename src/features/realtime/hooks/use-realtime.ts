import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

import { nftUpdatedEventSchema, orderUpdatedEventSchema, SOCKET_EVENTS } from '@/contracts/events'
import { useSession } from '@/features/auth/hooks/use-session'
import { createSocket } from '@/lib/realtime/socket'

import { applyNftUpdated } from '../lib/apply-nft-updated'
import { applyOrderUpdated } from '../lib/apply-order-updated'
import { createEventLedger } from '../lib/event-ledger'
import { reconcileActiveQueries } from '../lib/reconcile'

export function useRealtime() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { user, scope } = useSession()
  const userId = user?.id ?? null

  useEffect(() => {
    const socket = createSocket()
    const ledger = createEventLedger()
    const orderContext = {
      queryClient,
      scope,
      userId,
      openOrder: (orderId: string) =>
        void router.navigate({ to: '/pedido/$orderId', params: { orderId } }),
    }
    let connectedBefore = false

    socket.on('connect', () => {
      socket.emit(SOCKET_EVENTS.identify, { userId })
      if (connectedBefore) reconcileActiveQueries(queryClient, scope)
      connectedBefore = true
    })

    socket.on(SOCKET_EVENTS.nftUpdated, (payload) => {
      const parsed = nftUpdatedEventSchema.safeParse(payload)
      if (parsed.success && ledger.accept(parsed.data)) {
        applyNftUpdated(queryClient, scope, parsed.data)
      }
    })

    socket.on(SOCKET_EVENTS.orderUpdated, (payload) => {
      const parsed = orderUpdatedEventSchema.safeParse(payload)
      if (parsed.success && ledger.accept(parsed.data)) {
        applyOrderUpdated(orderContext, parsed.data)
      }
    })

    socket.connect()

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
    }
  }, [queryClient, router, scope, userId])
}
