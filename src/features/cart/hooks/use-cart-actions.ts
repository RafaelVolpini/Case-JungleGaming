import { toast } from 'sonner'

import type { CartItem } from '@/contracts/cart'
import { errorMessage } from '@/lib/http/errors'

import { useCartMutations } from './use-cart-mutations'

export function useCartActions() {
  const { update, remove } = useCartMutations()

  function changeQuantity(item: CartItem, quantity: number) {
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
