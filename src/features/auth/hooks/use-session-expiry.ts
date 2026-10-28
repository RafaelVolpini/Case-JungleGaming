import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { onSessionExpired } from '@/lib/auth/expiry'
import { clearToken, readToken } from '@/lib/auth/token'
import { resetQueryCache } from '@/lib/query/reset'

export function useSessionExpiry() {
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(
    () =>
      onSessionExpired(() => {
        if (!readToken()) return
        clearToken()
        void resetQueryCache(queryClient)
        toast.error('Sua sessão expirou. Entre novamente para continuar.')
        void router.navigate({
          to: '/entrar',
          search: { redirect: router.state.location.href, expired: '1' },
        })
      }),
    [router, queryClient],
  )
}
