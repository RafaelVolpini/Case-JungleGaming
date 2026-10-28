import { readStorage, removeStorage, writeStorage } from '@/lib/storage'

const PREFIX = 'kurio:idempotency:'

export function getIdempotencyKey(scope: string): string {
  const existing = readStorage(PREFIX + scope)
  if (existing) return existing
  const created = `idem-${crypto.randomUUID()}`
  writeStorage(PREFIX + scope, created)
  return created
}

export function clearIdempotencyKey(scope: string): void {
  removeStorage(PREFIX + scope)
}
