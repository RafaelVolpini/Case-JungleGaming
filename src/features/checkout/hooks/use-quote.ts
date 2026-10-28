import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Quote } from '@/contracts/quote'
import type { Wallet } from '@/contracts/wallet'
import { useSession } from '@/features/auth/hooks/use-session'
import { queryKeys } from '@/lib/query/keys'

import { acknowledgeQuoteRequest, createQuoteRequest } from '../api/checkout-api'

export function useQuote(wallet: Wallet | undefined) {
  const { scope, isAuthenticated } = useSession()

  return useQuery({
    queryKey: [...queryKeys.quote(scope), wallet?.id],
    queryFn: ({ signal }) =>
      createQuoteRequest({ walletId: wallet!.id, network: wallet!.network }, signal),
    enabled: isAuthenticated && Boolean(wallet),
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: true,
  })
}

export function useAcknowledgeQuote(walletId: string | undefined) {
  const queryClient = useQueryClient()
  const { scope } = useSession()

  return useMutation({
    mutationFn: (quote: Quote) => acknowledgeQuoteRequest(quote.id),
    onSuccess: (next) => {
      queryClient.setQueryData([...queryKeys.quote(scope), walletId], next)
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart(scope) })
    },
  })
}
