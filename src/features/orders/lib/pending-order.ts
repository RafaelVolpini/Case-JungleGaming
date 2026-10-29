import { readStorage, removeStorage, removeStorageByPrefix, writeStorage } from '@/lib/storage'

const PREFIX = 'kurio:pending-order:'
const key = (scope: string) => `${PREFIX}${scope}`

export function readPendingOrderId(scope: string): string | null {
  return readStorage(key(scope))
}

export function writePendingOrderId(scope: string, orderId: string): void {
  writeStorage(key(scope), orderId)
}

export function clearPendingOrderId(scope: string): void {
  removeStorage(key(scope))
}

export function clearAllPendingOrderIds(): void {
  removeStorageByPrefix(PREFIX)
}
