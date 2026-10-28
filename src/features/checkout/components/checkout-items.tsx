import { NftImage } from '@/components/nft/nft-image'
import type { Cart } from '@/contracts/cart'
import { formatTokenId } from '@/lib/format/token'
import { formatEth } from '@/lib/money/eth'

export function CheckoutItems({ items }: { items: Cart['items'] }) {
  return (
    <div>
      <div className="border-primary/40 flex justify-between border-b pb-[7px]" aria-hidden="true">
        <span className="text-cream text-base leading-6 font-bold">NFTs</span>
        <span className="text-cream text-base leading-6 font-bold">Subtotal</span>
      </div>
      <ul aria-label="Itens do pedido" className="mt-3 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id} className="bg-card flex h-[70px] items-center gap-2 pr-3.5 pl-1">
            <div className="size-[70px] shrink-0 overflow-hidden rounded-lg">
              <NftImage image={item.image} sizes="70px" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-cream truncate text-[17px] leading-6 font-bold">{item.name}</p>
              <p className="text-foreground/80 text-sm leading-5">
                ID do token: {formatTokenId(item.tokenId)}
              </p>
            </div>
            <p className="text-muted-foreground shrink-0 text-[15px]">(x {item.quantity})</p>
            <p className="text-primary-light w-[104px] shrink-0 text-right text-[17px] font-bold">
              {formatEth(item.subtotalEth)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
