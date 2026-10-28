import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'

import type { AuthResponse } from '@/contracts/session'
import { clearToken, writeToken } from '@/lib/auth/token'
import { queryKeys } from '@/lib/query/keys'
import { resetQueryCache } from '@/lib/query/reset'

import { loginRequest, logoutRequest, registerRequest } from '../api/auth-api'

export function useAuthActions() {
  const queryClient = useQueryClient()
  const router = useRouter()

  async function startSession(response: AuthResponse) {
    await resetQueryCache(queryClient)
    writeToken(response.token)
    queryClient.setQueryData(queryKeys.session, {
      user: response.user,
      expiresAt: response.expiresAt,
    })
  }

  const login = useMutation({ mutationFn: loginRequest, onSuccess: startSession })
  const register = useMutation({ mutationFn: registerRequest, onSuccess: startSession })

  const logout = useMutation({
    mutationFn: logoutRequest,
    onSettled: async () => {
      clearToken()
      await resetQueryCache(queryClient)
      await router.navigate({ to: '/', replace: true })
      toast.success('Você saiu da sua conta.')
    },
  })

  return { login, register, logout }
}
