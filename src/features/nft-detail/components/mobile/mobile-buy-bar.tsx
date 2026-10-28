import { useNavigate } from '@tanstack/react-router'
import { ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { QuantityStepper } from '@/components/shared/quantity-stepper'
import type { Edition, NftDetail } from '@/contracts/nft'
import { useCartMutations } from '@/features/cart/hooks/use-cart-mutations'
import { errorMessage } from '@/lib/http/errors'
import { formatEth } from '@/lib/money/eth'

type MobileBuyBarProps = { nft: NftDetail; edition: Edition }

export function MobileBuyBar({ nft, edition }: MobileBuyBarProps) {
  const navigate = useNavigate()
  const { add } = useCartMutations()
  const [quantity, setQuantity] = useState(1)
  const max = Math.max(1, Math.min(edition.available, nft.maxPerOrder))
  const soldOut = edition.available === 0
  const safeQuantity = Math.min(quantity, max)

  function addToCart(goToCart: boolean) {
    add.mutate(
      { nftId: nft.id, editionId: edition.id, quantity: safeQuantity },
      {
        onSuccess: () => {
          if (goToCart) void navigate({ to: '/carrinho' })
          else toast.success(`${nft.name} adicionado ao carrinho.`)
        },
        onError: (error) => toast.error(errorMessage(error)),
      },
    )
  }

  return (
    <div className="bg-card fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[640px] rounded-t-[28px] px-6 pt-5 pb-[34px] shadow-[0_-10px_24px_rgba(0,0,0,0.3)]">
      <div className="flex h-[30px] items-center justify-between">
        <div className="flex items-center gap-[13px]">
          <span className="text-foreground text-[15px] font-bold">Qtd.</span>
          <QuantityStepper
            size="compact"
            value={safeQuantity}
            max={max}
            onChange={setQuantity}
            disabled={soldOut}
            className="gap-[17px]"
          />
        </div>
        <p className="text-primary-light text-xl font-bold">{formatEth(edition.priceEth)}</p>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => addToCart(true)}
          disabled={soldOut || add.isPending}
          className="text-background focus-visible:ring-ring h-[60px] w-[196px] rounded-full bg-gradient-to-r from-[#d08a4c] to-[#b57844] text-base font-bold outline-none focus-visible:ring-2 disabled:opacity-50"
        >
          {soldOut ? 'Esgotado' : 'Comprar NFT'}
        </button>
        <button
          type="button"
          onClick={() => addToCart(false)}
          disabled={soldOut || add.isPending}
          aria-label="Adicionar ao carrinho"
          className="border-input bg-surface-raised text-placeholder focus-visible:ring-ring grid size-[60px] place-items-center rounded-full border outline-none focus-visible:ring-2 disabled:opacity-50"
        >
          <ShoppingCart className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
