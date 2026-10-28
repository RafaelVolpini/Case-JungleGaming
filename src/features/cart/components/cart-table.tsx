import type { Cart } from '@/contracts/cart'

import { CartRow, cartRowColumns } from './cart-row'
import { useCartActions } from '../hooks/use-cart-actions'

const headerClassName = 'text-cream text-base leading-6 font-bold'

export function CartTable({ cart }: { cart: Cart }) {
  const { changeQuantity, remove, isBusy } = useCartActions()

  return (
    <div>
      <div
        className={`hidden md:grid ${cartRowColumns} border-primary/40 border-b pb-[7px]`}
        aria-hidden="true"
      >
        <span className={headerClassName}>NFTs</span>
        <span className={headerClassName}>Preço</span>
        <span className={headerClassName}>Edições</span>
        <span className={headerClassName}>Total</span>
        <span />
      </div>
      <ul className="mt-3 flex flex-col gap-3" aria-label="Itens do carrinho">
        {cart.items.map((item) => (
          <CartRow
            key={item.id}
            item={item}
            busy={isBusy}
            onQuantityChange={(quantity) => changeQuantity(item, quantity)}
            onRemove={() => remove(item)}
          />
        ))}
      </ul>
    </div>
  )
}
