import { readStorage, removeStorage, writeStorage } from '@/lib/storage'

const key = (scope: string) => `kurio:pending-order:${scope}`

export function readPendingOrderId(scope: string): string | null {
  return readStorage(key(scope))
}

export function writePendingOrderId(scope: string, orderId: string): void {
  writeStorage(key(scope), orderId)
}

export function clearPendingOrderId(scope: string): void {
  removeStorage(key(scope))
}
