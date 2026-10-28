import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'

import { QuantityStepper } from '@/components/shared/quantity-stepper'
import { Button } from '@/components/ui/button'
import type { Edition, NftDetail } from '@/contracts/nft'
import { useCartMutations } from '@/features/cart/hooks/use-cart-mutations'
import { FavoriteAction } from '@/features/favorites/components/favorite-action'
import { errorMessage } from '@/lib/http/errors'

type PurchaseActionsProps = { nft: NftDetail; edition: Edition }

export function PurchaseActions({ nft, edition }: PurchaseActionsProps) {
  const navigate = useNavigate()
  const { add } = useCartMutations()
  const [quantity, setQuantity] = useState(1)
  const max = Math.max(1, Math.min(edition.available, nft.maxPerOrder))
  const soldOut = edition.available === 0
  const safeQuantity = Math.min(quantity, max)

  function buy() {
    add.mutate(
      { nftId: nft.id, editionId: edition.id, quantity: safeQuantity },
      {
        onSuccess: () => void navigate({ to: '/carrinho' }),
        onError: (error) => toast.error(errorMessage(error)),
      },
    )
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <QuantityStepper value={safeQuantity} max={max} onChange={setQuantity} disabled={soldOut} />
      </div>
      <div className="flex gap-[30px]">
        <Button
          onClick={buy}
          disabled={soldOut || add.isPending}
          className="h-10 w-[130px] rounded-md text-base"
        >
          {soldOut ? 'ESGOTADO' : add.isPending ? 'ADICIONANDO' : 'COMPRAR'}
        </Button>
        <FavoriteAction nftId={nft.id} name={nft.name} initial={nft.isFavorite} />
      </div>
    </div>
  )
}
