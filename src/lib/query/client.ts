import { QueryClient } from '@tanstack/react-query'

/**
 * Cache policy is documented in ARCHITECTURE.md.
 *
 * `staleTime` is deliberately non-zero: Socket.IO pushes the mutations that
 * matter (price, availability, order state), so background refetching is a
 * fallback rather than the primary freshness mechanism.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: (failureCount, error) => {
          // Never retry what will not change: validation, auth, not-found.
          const status = (error as { status?: number } | null)?.status
          if (status !== undefined && status >= 400 && status < 500) return false
          return failureCount < 2
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
}
