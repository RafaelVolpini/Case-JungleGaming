import { Link } from '@tanstack/react-router'
import { Trash } from 'lucide-react'

import { NftImage } from '@/components/nft/nft-image'
import { QuantityStepper } from '@/components/shared/quantity-stepper'
import type { CartItem } from '@/contracts/cart'
import { formatTokenId } from '@/lib/format/token'
import { formatEth } from '@/lib/money/eth'

export const cartRowColumns = 'md:grid-cols-[311.5px_138.5px_136px_1fr_36px]'

type CartRowProps = {
  item: CartItem
  busy: boolean
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}

export function CartRow({ item, busy, onQuantityChange, onRemove }: CartRowProps) {
  return (
    <li className={`bg-card grid h-[70px] items-center ${cartRowColumns}`}>
      <div className="flex min-w-0 items-center gap-4">
        <Link
          to="/nft/$slug"
          params={{ slug: item.nftSlug }}
          className="focus-visible:ring-ring block size-[70px] shrink-0 overflow-hidden rounded-lg outline-none focus-visible:ring-2"
        >
          <NftImage image={item.image} sizes="70px" />
        </Link>
        <div className="min-w-0">
          <p className="text-cream truncate text-[17px] leading-6 font-bold">{item.name}</p>
          <p className="text-foreground/80 text-sm leading-5">
            ID do token: {formatTokenId(item.tokenId)}
          </p>
          <p className="sr-only">Edição {item.edition.label}</p>
        </div>
      </div>
      <p className="text-foreground text-[17px] font-bold">{formatEth(item.unitPriceEth)}</p>
      <QuantityStepper
        size="compact"
        value={item.quantity}
        max={Math.max(item.maxQuantity, item.quantity)}
        disabled={busy}
        label={`Quantidade de ${item.name}`}
        onChange={onQuantityChange}
        className="gap-[17px]"
      />
      <p className="text-primary-light text-[17px] font-bold">{formatEth(item.subtotalEth)}</p>
      <button
        type="button"
        aria-label={`Remover ${item.name} do carrinho`}
        onClick={onRemove}
        disabled={busy}
        className="text-foreground hover:text-primary-light focus-visible:ring-ring justify-self-end rounded outline-none transition-colors focus-visible:ring-2 disabled:opacity-50"
      >
        <Trash className="size-5" aria-hidden="true" />
      </button>
    </li>
  )
}
