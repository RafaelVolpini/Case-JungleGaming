import type { CreateOrderInput } from '@/contracts/order'
import { readStorage, removeStorage, removeStorageByPrefix, writeStorage } from '@/lib/storage'

export type OrderAttempt = { input: CreateOrderInput }

const PREFIX = 'kurio:order-attempt:'
const key = (scope: string) => `${PREFIX}${scope}`
const listeners = new Set<() => void>()

function notify(): void {
  listeners.forEach((listener) => listener())
}

export function subscribeOrderAttempt(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function readOrderAttemptSnapshot(scope: string): string | null {
  return readStorage(key(scope))
}

export function parseOrderAttempt(snapshot: string | null): OrderAttempt | null {
  if (!snapshot) return null
  try {
    return JSON.parse(snapshot) as OrderAttempt
  } catch {
    return null
  }
}

export function writeOrderAttempt(scope: string, attempt: OrderAttempt): void {
  writeStorage(key(scope), JSON.stringify(attempt))
  notify()
}

export function clearOrderAttempt(scope: string): void {
  removeStorage(key(scope))
  notify()
}

export function clearAllOrderAttempts(): void {
  removeStorageByPrefix(PREFIX)
  notify()
}

export function resolveOrderInput(scope: string, input: CreateOrderInput): CreateOrderInput {
  return parseOrderAttempt(readOrderAttemptSnapshot(scope))?.input ?? input
}
