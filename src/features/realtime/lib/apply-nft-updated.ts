import type { QueryClient } from '@tanstack/react-query'
import { toast } from '@/lib/toast'

import type { Cart } from '@/contracts/cart'
import type { NftUpdatedEvent } from '@/contracts/events'
import { recordCartNote, type CartChangeNote } from '@/features/cart/lib/cart-change-notes'
import { isAwaitingOwnOrder } from '@/features/orders/lib/pending-order'
import { compareEth, formatEth } from '@/lib/money/eth'
import { queryKeys } from '@/lib/query/keys'

import { patchNftData } from './patch-nft'

type CartChange = { itemId: string; message: string; note: CartChangeNote }

function describeCartChanges(cart: Cart | undefined, event: NftUpdatedEvent): CartChange[] {
  if (!cart) return []

  return cart.items
    .filter((item) => item.nftId === event.id)
    .flatMap((item) => {
      const edition = event.editions.find((candidate) => candidate.id === item.edition.id)
      if (!edition) return []
      const changes: CartChange[] = []
      const priceOrder = compareEth(edition.priceEth, item.unitPriceEth)
      if (priceOrder !== 0) {
        changes.push({
          itemId: item.id,
          message: `O preço de ${item.name} mudou de ${formatEth(item.unitPriceEth)} para ${formatEth(edition.priceEth)}.`,
          note: {
            kind: 'price',
            from: item.unitPriceEth,
            direction: priceOrder > 0 ? 'up' : 'down',
          },
        })
      }
      if (edition.available < item.quantity) {
        changes.push({
          itemId: item.id,
          message: `A disponibilidade de ${item.name} foi reduzida para ${edition.available}.`,
          note: { kind: 'availability', available: edition.available },
        })
      }
      return changes
    })
}

export function applyNftUpdated(queryClient: QueryClient, scope: string, event: NftUpdatedEvent) {
  const cartKey = queryKeys.cart(scope)
  const changes = isAwaitingOwnOrder(scope)
    ? []
    : describeCartChanges(queryClient.getQueryData<Cart>(cartKey), event)

  queryClient.setQueriesData({ queryKey: ['catalog', scope] }, (data) => patchNftData(data, event))
  queryClient.setQueriesData({ queryKey: ['private', scope, 'favorites', 'list'] }, (data) =>
    patchNftData(data, event),
  )
  void queryClient.invalidateQueries({ queryKey: cartKey })
  void queryClient.invalidateQueries({ queryKey: queryKeys.quote(scope) })

  for (const change of changes) {
    recordCartNote(scope, change.itemId, change.note)
    toast.warning(change.message)
  }
}
