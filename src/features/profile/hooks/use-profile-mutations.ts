import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { Session } from '@/contracts/session'
import { queryKeys } from '@/lib/query/keys'

import { changePasswordRequest, updateProfileRequest } from '../api/profile-api'

export function useProfileMutations() {
  const queryClient = useQueryClient()

  const updateProfile = useMutation({
    mutationFn: updateProfileRequest,
    onSuccess: (user) =>
      queryClient.setQueryData<Session>(queryKeys.session, (current) =>
        current ? { ...current, user } : current,
      ),
  })

  const changePassword = useMutation({ mutationFn: changePasswordRequest })

  return { updateProfile, changePassword }
}
