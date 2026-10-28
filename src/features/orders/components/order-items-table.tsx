import { NftImage } from '@/components/nft/nft-image'
import type { OrderItem } from '@/contracts/order'
import { formatTokenId } from '@/lib/format/token'
import { formatEth } from '@/lib/money/eth'

const COLUMNS =
  'grid grid-cols-[1fr_auto] items-center gap-x-2 md:grid-cols-[1fr_90px_115px] md:gap-x-0'

function ItemRow({ item }: { item: OrderItem }) {
  return (
    <li className={`${COLUMNS} h-[70px]`}>
      <div className="flex min-w-0 items-center gap-3">
        <div className="size-[70px] shrink-0 overflow-hidden rounded-lg">
          <NftImage image={item.image} sizes="70px" className="size-full" />
        </div>
        <div className="min-w-0">
          <p className="text-cream truncate text-base leading-[22px] font-bold">{item.name}</p>
          <p className="text-placeholder truncate text-sm leading-[22px]">
            ID do token: {formatTokenId(item.tokenId)}
            <span className="text-foreground md:hidden"> · x{item.quantity}</span>
          </p>
        </div>
      </div>
      <p className="text-foreground hidden pr-2.5 text-center text-[13px] md:block">
        (x {item.quantity})
      </p>
      <p className="text-primary-light pr-1 text-right text-base font-bold md:text-lg">
        {formatEth(item.subtotalEth)}
      </p>
    </li>
  )
}

export function OrderItemsTable({ items }: { items: OrderItem[] }) {
  return (
    <div>
      <div
        aria-hidden="true"
        className={`${COLUMNS} border-divider text-cream hidden border-b pb-2 text-base leading-6 font-bold md:grid`}
      >
        <span>NFTs</span>
        <span className="text-center">Edições</span>
        <span className="text-right">Subtotal</span>
      </div>
      <ul aria-label="Itens do pedido" className="mt-[11.5px] flex flex-col gap-3">
        {items.map((item) => (
          <ItemRow key={`${item.nftId}-${item.edition.id}`} item={item} />
        ))}
      </ul>
    </div>
  )
}
