import { queryOptions } from '@tanstack/react-query'

import { queryKeys } from '@/lib/query/keys'

import { fetchSession } from './auth-api'

export const SESSION_STALE_MS = 60_000

export function sessionQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.session,
    queryFn: fetchSession,
    staleTime: SESSION_STALE_MS,
    retry: false,
  })
}
