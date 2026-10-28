import { useEffect } from 'react'

import { useSession } from '@/features/auth/hooks/use-session'

import { clearPendingOrderId, readPendingOrderId } from '../lib/pending-order'
import { useOrder } from './use-order'

export function usePendingOrder() {
  const { scope } = useSession()
  const orderId = readPendingOrderId(scope)
  const { data } = useOrder(orderId ?? '')
  const settled = data !== undefined && data.status !== 'pending'

  useEffect(() => {
    if (settled) clearPendingOrderId(scope)
  }, [settled, scope])

  return orderId && data?.status === 'pending' ? data : null
}
