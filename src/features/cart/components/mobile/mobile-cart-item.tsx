import { Link } from '@tanstack/react-router'
import { Trash } from 'lucide-react'

import { NftImage } from '@/components/nft/nft-image'
import { QuantityStepper } from '@/components/shared/quantity-stepper'
import type { CartItem } from '@/contracts/cart'
import { formatEth } from '@/lib/money/eth'

type MobileCartItemProps = {
  item: CartItem
  busy: boolean
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}

export function MobileCartItem({ item, busy, onQuantityChange, onRemove }: MobileCartItemProps) {
  return (
    <li className="bg-card relative flex h-[100px] overflow-hidden rounded-[20px]">
      <Link
        to="/nft/$slug"
        params={{ slug: item.nftSlug }}
        className="focus-visible:ring-ring block size-[100px] shrink-0 outline-none focus-visible:ring-2"
      >
        <NftImage image={item.image} sizes="100px" className="size-full" />
      </Link>
      <div className="min-w-0 flex-1 pt-[11px] pl-[13px]">
        <p className="text-cream truncate text-[15px] leading-[21px] font-bold">{item.name}</p>
        <p className="text-foreground text-sm leading-[21px]">Edição: {item.edition.label}</p>
        <p className="text-primary-light mt-[13px] text-lg leading-6 font-bold">
          {formatEth(item.subtotalEth)}
        </p>
      </div>
      <QuantityStepper
        size="round"
        value={item.quantity}
        max={Math.max(item.maxQuantity, item.quantity)}
        disabled={busy}
        label={`Quantidade de ${item.name}`}
        onChange={onQuantityChange}
        className="absolute top-[38px] right-4 gap-[9px]"
      />
      <button
        type="button"
        aria-label={`Remover ${item.name} do carrinho`}
        onClick={onRemove}
        disabled={busy}
        className="text-placeholder hover:text-primary-light focus-visible:ring-ring absolute right-[14px] bottom-[10px] rounded outline-none focus-visible:ring-2 disabled:opacity-50"
      >
        <Trash className="size-[18px]" aria-hidden="true" />
      </button>
    </li>
  )
}
