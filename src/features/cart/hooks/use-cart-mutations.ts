import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { Cart } from '@/contracts/cart'
import { useSession } from '@/features/auth/hooks/use-session'
import { queryKeys } from '@/lib/query/keys'

import {
  addCartItem,
  applyCoupon,
  removeCartItem,
  removeCoupon,
  updateCartItem,
} from '../api/cart-api'

export function useCartMutations() {
  const queryClient = useQueryClient()
  const { scope } = useSession()
  const cartKey = queryKeys.cart(scope)

  const store = (cart: Cart) => {
    queryClient.setQueryData(cartKey, cart)
  }
  const refresh = () => queryClient.invalidateQueries({ queryKey: cartKey })

  const add = useMutation({ mutationFn: addCartItem, onSuccess: store, onError: refresh })

  const update = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItem(itemId, { quantity }),
    onSuccess: store,
    onError: refresh,
  })

  const remove = useMutation({ mutationFn: removeCartItem, onSuccess: store, onError: refresh })
  const applyCode = useMutation({ mutationFn: applyCoupon, onSuccess: store })
  const removeCode = useMutation({ mutationFn: removeCoupon, onSuccess: store })

  return { add, update, remove, applyCode, removeCode }
}
