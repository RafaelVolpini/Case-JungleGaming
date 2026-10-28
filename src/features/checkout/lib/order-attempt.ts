import type { CreateOrderInput } from '@/contracts/order'
import { readStorage, removeStorage, writeStorage } from '@/lib/storage'

export type OrderAttempt = { input: CreateOrderInput }

const key = (scope: string) => `kurio:order-attempt:${scope}`
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
