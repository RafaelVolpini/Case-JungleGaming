import { clearCartNotes } from '@/features/cart/lib/cart-change-notes'
import { clearAllOrderAttempts } from '@/features/checkout/lib/order-attempt'
import { clearAllPendingOrderIds } from '@/features/orders/lib/pending-order'
import { clearToken } from '@/lib/auth/token'
import { clearAllIdempotencyKeys } from '@/lib/idempotency'

export function clearPrivateData(): void {
  clearToken()
  clearCartNotes()
  clearAllOrderAttempts()
  clearAllPendingOrderIds()
  clearAllIdempotencyKeys()
}
