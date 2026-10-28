import { API_UNREACHABLE_EVENT } from '@/lib/http/unreachable'

const PING_URL = '/api/__mock__/ping'
const CHECK_INTERVAL_MS = 15_000
const ACTIVATE_MESSAGE = 'MOCK_ACTIVATE'

async function isServing(): Promise<boolean> {
  try {
    const response = await fetch(PING_URL, { cache: 'no-store' })
    return (response.headers.get('content-type') ?? '').includes('json')
  } catch {
    return false
  }
}

let restoring: Promise<void> | null = null

function restore(): Promise<void> {
  restoring ??= isServing()
    .then((serving) => {
      if (!serving) navigator.serviceWorker.controller?.postMessage(ACTIVATE_MESSAGE)
    })
    .finally(() => {
      restoring = null
    })
  return restoring
}

export function guardMockWorker(): () => void {
  if (!('serviceWorker' in navigator)) return () => {}

  const run = () => void restore()
  const onVisible = () => {
    if (document.visibilityState === 'visible') run()
  }
  const timer = window.setInterval(onVisible, CHECK_INTERVAL_MS)

  window.addEventListener(API_UNREACHABLE_EVENT, run)
  window.addEventListener('focus', run)
  window.addEventListener('online', run)
  document.addEventListener('visibilitychange', onVisible)

  return () => {
    window.clearInterval(timer)
    window.removeEventListener(API_UNREACHABLE_EVENT, run)
    window.removeEventListener('focus', run)
    window.removeEventListener('online', run)
    document.removeEventListener('visibilitychange', onVisible)
  }
}
