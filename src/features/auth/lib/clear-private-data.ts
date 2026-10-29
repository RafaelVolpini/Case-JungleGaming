import { clearAllOrderAttempts } from '@/features/checkout/lib/order-attempt'
import { clearAllPendingOrderIds } from '@/features/orders/lib/pending-order'
import { clearToken } from '@/lib/auth/token'
import { clearAllIdempotencyKeys } from '@/lib/idempotency'

export function clearPrivateData(): void {
  clearToken()
  clearAllOrderAttempts()
  clearAllPendingOrderIds()
  clearAllIdempotencyKeys()
}
