const FALLBACK_DELAY_MS = 200

export function whenIdle(task: () => void, timeoutMs = 2000): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const handle = window.requestIdleCallback(task, { timeout: timeoutMs })
    return () => window.cancelIdleCallback(handle)
  }
  const handle = window.setTimeout(task, FALLBACK_DELAY_MS)
  return () => window.clearTimeout(handle)
}
