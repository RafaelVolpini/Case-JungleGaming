import { useQuery } from '@tanstack/react-query'

import { useSession } from '@/features/auth/hooks/use-session'

import { walletsQueryOptions } from '../api/wallets-queries'

export function useWallets() {
  const { scope, isAuthenticated } = useSession()
  return useQuery({ ...walletsQueryOptions(scope), enabled: isAuthenticated })
}
