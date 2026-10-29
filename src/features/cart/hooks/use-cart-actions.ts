import { toast } from 'sonner'

import type { CartItem } from '@/contracts/cart'
import { useSession } from '@/features/auth/hooks/use-session'
import { errorMessage } from '@/lib/http/errors'

import { dismissCartNote } from '../lib/cart-change-notes'
import { useCartMutations } from './use-cart-mutations'

export function useCartActions() {
  const { update, remove } = useCartMutations()
  const { scope } = useSession()

  function changeQuantity(item: CartItem, quantity: number) {
    dismissCartNote(scope, item.id)
    update.mutate(
      { itemId: item.id, quantity },
      { onError: (error) => toast.error(errorMessage(error)) },
    )
  }

  function removeItem(item: CartItem) {
    remove.mutate(item.id, {
      onSuccess: () => toast.success(`${item.name} removido do carrinho.`),
      onError: (error) => toast.error(errorMessage(error)),
    })
  }

  return {
    changeQuantity,
    remove: removeItem,
    isBusy: update.isPending || remove.isPending,
  }
}
