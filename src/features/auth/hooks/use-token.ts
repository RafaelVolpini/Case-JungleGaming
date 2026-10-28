import { useSyncExternalStore } from 'react'

import { readToken, subscribeToken } from '@/lib/auth/token'

export function useToken(): string | null {
  return useSyncExternalStore(subscribeToken, readToken, () => null)
}
