import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import { toast } from '@/lib/toast'

import { onSessionExpired } from '@/lib/auth/expiry'
import { clearToken, readToken } from '@/lib/auth/token'
import { resetQueryCache } from '@/lib/query/reset'

const AUTH_PATHS = ['/entrar', '/criar-conta']

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
        const { isLoading, location } = router.state
        if (isLoading || AUTH_PATHS.includes(location.pathname)) return
        void router.navigate({
          to: '/entrar',
          search: { redirect: router.state.location.href, expired: '1' },
        })
      }),
    [router, queryClient],
  )
}
