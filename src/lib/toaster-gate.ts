import { useSyncExternalStore } from 'react'

let requested = false
let mounted = false
let release: () => void = () => {}
let pending: Promise<void> | null = null
const listeners = new Set<() => void>()

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function requestToaster(): Promise<void> {
  if (mounted) return Promise.resolve()
  if (!pending) {
    pending = new Promise<void>((resolve) => {
      release = resolve
    })
    requested = true
    listeners.forEach((listener) => listener())
  }
  return pending
}

export function reportToasterMounted(): void {
  mounted = true
  release()
}

export function useToasterRequested(): boolean {
  return useSyncExternalStore(subscribe, () => requested)
}
