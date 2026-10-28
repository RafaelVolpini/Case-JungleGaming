import type { QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { NftUpdatedEvent } from '@/contracts/events'
import type { Cart } from '@/contracts/cart'
import { compareEth, formatEth } from '@/lib/money/eth'
import { queryKeys } from '@/lib/query/keys'

import { patchNftData } from './patch-nft'

function describeCartChanges(cart: Cart | undefined, event: NftUpdatedEvent): string[] {
  if (!cart) return []

  return cart.items
    .filter((item) => item.nftId === event.id)
    .flatMap((item) => {
      const edition = event.editions.find((candidate) => candidate.id === item.edition.id)
      if (!edition) return []
      const messages: string[] = []
      if (compareEth(edition.priceEth, item.unitPriceEth) !== 0) {
        messages.push(
          `O preço de ${item.name} mudou de ${formatEth(item.unitPriceEth)} para ${formatEth(edition.priceEth)}.`,
        )
      }
      if (edition.available < item.quantity) {
        messages.push(`A disponibilidade de ${item.name} foi reduzida para ${edition.available}.`)
      }
      return messages
    })
}

export function applyNftUpdated(queryClient: QueryClient, scope: string, event: NftUpdatedEvent) {
  const cartKey = queryKeys.cart(scope)
  const messages = describeCartChanges(queryClient.getQueryData<Cart>(cartKey), event)

  queryClient.setQueriesData({ queryKey: ['catalog', scope] }, (data) => patchNftData(data, event))
  queryClient.setQueriesData({ queryKey: ['private', scope, 'favorites', 'list'] }, (data) =>
    patchNftData(data, event),
  )
  void queryClient.invalidateQueries({ queryKey: cartKey })
  void queryClient.invalidateQueries({ queryKey: queryKeys.quote(scope) })

  for (const message of messages) toast.warning(message)
}
