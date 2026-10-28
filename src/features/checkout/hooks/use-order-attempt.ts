import { useMemo, useSyncExternalStore } from 'react'

import { useSession } from '@/features/auth/hooks/use-session'

import {
  parseOrderAttempt,
  readOrderAttemptSnapshot,
  subscribeOrderAttempt,
} from '../lib/order-attempt'

export function useOrderAttempt() {
  const { scope } = useSession()
  const snapshot = useSyncExternalStore(
    subscribeOrderAttempt,
    () => readOrderAttemptSnapshot(scope),
    () => null,
  )

  return useMemo(() => parseOrderAttempt(snapshot), [snapshot])
}
