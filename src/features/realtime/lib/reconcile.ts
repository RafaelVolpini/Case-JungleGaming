import type { QueryClient } from '@tanstack/react-query'

export function reconcileActiveQueries(queryClient: QueryClient, scope: string): void {
  void queryClient.invalidateQueries({ queryKey: ['catalog', scope], refetchType: 'active' })
  void queryClient.invalidateQueries({ queryKey: ['private', scope], refetchType: 'active' })
}
