import { useQuery } from '@tanstack/react-query'

import type { User } from '@/contracts/session'
import { GUEST_SCOPE } from '@/lib/query/keys'

import { sessionQueryOptions } from '../api/session-query'
import { useToken } from './use-token'

export type SessionState = {
  user: User | null
  scope: string
  isLoading: boolean
  isAuthenticated: boolean
}

export function useSession(): SessionState {
  const token = useToken()
  const query = useQuery({ ...sessionQueryOptions(), enabled: Boolean(token) })
  const user = token ? (query.data?.user ?? null) : null

  return {
    user,
    scope: user?.id ?? GUEST_SCOPE,
    isLoading: Boolean(token) && query.isPending,
    isAuthenticated: user !== null,
  }
}
