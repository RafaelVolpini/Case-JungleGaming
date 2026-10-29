import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { toast } from '@/lib/toast'

import type { FavoriteIds } from '@/contracts/favorite'
import { useSession } from '@/features/auth/hooks/use-session'
import { errorMessage } from '@/lib/http/errors'
import { queryKeys } from '@/lib/query/keys'

import { addFavorite, removeFavorite } from '../api/favorites-api'

type ToggleInput = { nftId: string; isFavorite: boolean; name: string }

export function useToggleFavorite() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { scope, isAuthenticated } = useSession()
  const href = useRouterState({ select: (state) => state.location.href })
  const idsKey = queryKeys.favorites.ids(scope)

  const mutation = useMutation({
    mutationFn: ({ nftId, isFavorite }: ToggleInput) =>
      isFavorite ? removeFavorite(nftId) : addFavorite(nftId),

    onMutate: async ({ nftId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: idsKey })
      const previous = queryClient.getQueryData<FavoriteIds>(idsKey)
      queryClient.setQueryData<FavoriteIds>(idsKey, (current) => {
        const ids = current?.nftIds ?? []
        return { nftIds: isFavorite ? ids.filter((id) => id !== nftId) : [...ids, nftId] }
      })
      return { previous }
    },

    onError: (error, _input, context) => {
      queryClient.setQueryData(idsKey, context?.previous)
      toast.error(`Não foi possível atualizar seus favoritos. ${errorMessage(error)}`)
    },

    onSuccess: (_data, { isFavorite, name }) => {
      toast.success(
        isFavorite ? `${name} removido dos favoritos.` : `${name} adicionado aos favoritos.`,
      )
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: idsKey })
      void queryClient.invalidateQueries({ queryKey: ['private', scope, 'favorites', 'list'] })
    },
  })

  function toggle(input: ToggleInput) {
    if (!isAuthenticated) {
      toast.info('Entre na sua conta para salvar favoritos.')
      void navigate({ to: '/entrar', search: { redirect: href } })
      return
    }
    mutation.mutate(input)
  }

  return { toggle, isPending: mutation.isPending }
}
