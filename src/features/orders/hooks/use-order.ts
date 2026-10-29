import { useQuery } from '@tanstack/react-query'

import { useSession } from '@/features/auth/hooks/use-session'
import { queryKeys } from '@/lib/query/keys'

import { fetchOrderRequest } from '../../checkout/api/checkout-api'

const POLL_INTERVAL_MS = 1500

export function useOrder(orderId: string) {
  const { scope, isAuthenticated } = useSession()

  return useQuery({
    queryKey: queryKeys.orders.detail(scope, orderId),
    queryFn: ({ signal }) => fetchOrderRequest(orderId, signal),
    enabled: isAuthenticated && orderId !== '',
    refetchInterval: (query) => (query.state.data?.status === 'pending' ? POLL_INTERVAL_MS : false),
    retry: (count, error) => (error as { status?: number }).status !== 404 && count < 2,
  })
}
