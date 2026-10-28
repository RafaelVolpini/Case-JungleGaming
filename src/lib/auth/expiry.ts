let handler: (() => void) | null = null

export function onSessionExpired(listener: () => void): () => void {
  handler = listener
  return () => {
    if (handler === listener) handler = null
  }
}

export function notifySessionExpired(): void {
  handler?.()
}
