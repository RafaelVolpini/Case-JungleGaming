import { useSyncExternalStore } from 'react'

import type { EthAmount } from '@/contracts/common'

export type CartChangeNote =
  | { kind: 'price'; from: EthAmount; direction: 'up' | 'down' }
  | { kind: 'availability'; available: number }

const notes = new Map<string, CartChangeNote>()
const listeners = new Set<() => void>()

const keyOf = (scope: string, itemId: string) => `${scope}:${itemId}`

function notify(): void {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function recordCartNote(scope: string, itemId: string, note: CartChangeNote): void {
  notes.set(keyOf(scope, itemId), note)
  notify()
}

export function dismissCartNote(scope: string, itemId: string): void {
  if (notes.delete(keyOf(scope, itemId))) notify()
}

export function clearCartNotes(): void {
  if (notes.size === 0) return
  notes.clear()
  notify()
}

export function useCartNote(scope: string, itemId: string): CartChangeNote | undefined {
  return useSyncExternalStore(subscribe, () => notes.get(keyOf(scope, itemId)))
}
