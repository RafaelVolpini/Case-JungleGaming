import { useState } from 'react'

import type { Edition, NftDetail } from '@/contracts/nft'

export function usePurchaseQuantity(nft: NftDetail, edition: Edition) {
  const [quantity, setQuantity] = useState(1)
  const max = Math.max(1, Math.min(edition.available, nft.maxPerOrder))
  const soldOut = edition.available === 0
  const maxMessage =
    edition.available <= nft.maxPerOrder
      ? `Só restam ${edition.available} desta edição.`
      : `O limite é de ${nft.maxPerOrder} por pedido.`

  return { quantity: Math.min(quantity, max), setQuantity, max, soldOut, maxMessage }
}
