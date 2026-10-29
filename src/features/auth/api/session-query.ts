import { queryOptions } from '@tanstack/react-query'

import { ApiRequestError } from '@/lib/http/errors'
import { queryKeys } from '@/lib/query/keys'

import { fetchSession } from './auth-api'

export const SESSION_STALE_MS = 60_000
const SESSION_RETRIES = 2

function retryTransient(failureCount: number, error: unknown): boolean {
  return failureCount < SESSION_RETRIES && error instanceof ApiRequestError && error.isTransient
}

export function sessionQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.session,
    queryFn: fetchSession,
    staleTime: SESSION_STALE_MS,
    retry: retryTransient,
  })
}
