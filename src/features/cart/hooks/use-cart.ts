import { useQuery } from '@tanstack/react-query'

import { useSession } from '@/features/auth/hooks/use-session'

import { cartQueryOptions } from '../api/cart-query'

export function useCart() {
  const { scope } = useSession()
  return useQuery(cartQueryOptions(scope))
}

export function useCartCount(): number {
  const { data } = useCart()
  return data?.items.length ?? 0
}
