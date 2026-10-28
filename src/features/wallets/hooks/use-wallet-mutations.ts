import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { WalletInput } from '@/contracts/wallet'
import { useSession } from '@/features/auth/hooks/use-session'
import { queryKeys } from '@/lib/query/keys'

import { createWallet, updateWallet } from '../api/wallets-api'

type SaveWalletInput = { id?: string; input: WalletInput }

export function useSaveWallet() {
  const queryClient = useQueryClient()
  const { scope } = useSession()

  return useMutation({
    mutationFn: ({ id, input }: SaveWalletInput) =>
      id ? updateWallet(id, input) : createWallet(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.wallets(scope) }),
  })
}
