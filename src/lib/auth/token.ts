import { readStorage, removeStorage, writeStorage } from '@/lib/storage'

const TOKEN_KEY = 'kurio:session-token'
const listeners = new Set<() => void>()

export function readToken(): string | null {
  return readStorage(TOKEN_KEY)
}

export function writeToken(token: string): void {
  writeStorage(TOKEN_KEY, token)
  listeners.forEach((listener) => listener())
}

export function clearToken(): void {
  removeStorage(TOKEN_KEY)
  listeners.forEach((listener) => listener())
}

export function subscribeToken(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
