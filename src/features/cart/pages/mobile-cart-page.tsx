import { ErrorState } from '@/components/feedback/error-state'
import { BackButton } from '@/components/shared/back-button'

import { CartEmpty } from '../components/cart-empty'
import { MobileCartItem } from '../components/mobile/mobile-cart-item'
import { MobileCartSkeleton } from '../components/mobile/mobile-cart-skeleton'
import { MobileCartSummary } from '../components/mobile/mobile-cart-summary'
import { useCartActions } from '../hooks/use-cart-actions'
import { useCart } from '../hooks/use-cart'

export function MobileCartPage() {
  const { data: cart, error, isPending, refetch } = useCart()
  const { changeQuantity, remove, isBusy } = useCartActions()
  const hasItems = Boolean(cart && cart.items.length > 0)

  return (
    <div className="px-6 pt-8" style={{ paddingBottom: hasItems ? 380 : 40 }}>
      <header className="relative flex h-[35px] items-center justify-center px-1">
        <BackButton fallback="/" className="absolute left-1" />
        <h1 className="text-cream text-xl leading-7 font-bold">Carrinho de NFTs</h1>
      </header>
      <div className="mt-[21px]">
        {isPending && <MobileCartSkeleton />}
        {error && !cart && (
          <ErrorState
            error={error}
            onRetry={() => void refetch()}
            title="Não foi possível carregar o carrinho"
          />
        )}
        {cart && cart.items.length === 0 && <CartEmpty />}
        {cart && cart.items.length > 0 && (
          <ul aria-label="Itens do carrinho" className="flex flex-col gap-5">
            {cart.items.map((item) => (
              <MobileCartItem
                key={item.id}
                item={item}
                busy={isBusy}
                onQuantityChange={(quantity) => changeQuantity(item, quantity)}
                onRemove={() => remove(item)}
              />
            ))}
          </ul>
        )}
      </div>
      {cart && cart.items.length > 0 && <MobileCartSummary cart={cart} />}
    </div>
  )
}
