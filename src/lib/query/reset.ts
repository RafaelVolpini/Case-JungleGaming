import type { QueryClient } from '@tanstack/react-query'

export async function resetQueryCache(queryClient: QueryClient): Promise<void> {
  await queryClient.cancelQueries()
  queryClient.removeQueries()
}
