import { useEffect, useState } from 'react'

import { whenIdle } from './when-idle'

export function useIdleReady(timeoutMs?: number): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => whenIdle(() => setReady(true), timeoutMs), [timeoutMs])

  return ready
}
