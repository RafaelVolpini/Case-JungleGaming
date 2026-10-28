import { ErrorState } from '@/components/feedback/error-state'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'

import { CartEmpty } from '../components/cart-empty'
import { CartRecommendations } from '../components/cart-recommendations'
import { CartSkeleton } from '../components/cart-skeleton'
import { CartTable } from '../components/cart-table'
import { OrderSummary } from '../components/order-summary'
import { useCart } from '../hooks/use-cart'

export function CartPage() {
  const { data: cart, error, isPending, refetch } = useCart()
  const firstItem = cart?.items[0]

  return (
    <div className="page-container pt-4 md:pt-[28px]">
      <Breadcrumbs
        items={[{ label: 'Início', to: '/' }, { label: 'Mercado', to: '/' }, { label: 'Carrinho' }]}
      />
      <h1 className="sr-only">Carrinho de NFTs</h1>
      <div className="mt-1">
        {isPending && <CartSkeleton />}
        {error && !cart && (
          <ErrorState
            error={error}
            onRetry={() => void refetch()}
            title="Não foi possível carregar o carrinho"
          />
        )}
        {cart && cart.items.length === 0 && <CartEmpty />}
        {cart && cart.items.length > 0 && (
          <div className="md:grid md:grid-cols-[782px_1fr] md:gap-x-[86px]">
            <CartTable cart={cart} />
            <div className="mt-8 md:mt-0">
              <OrderSummary cart={cart} />
            </div>
          </div>
        )}
      </div>
      {firstItem && <CartRecommendations slug={firstItem.nftSlug} />}
    </div>
  )
}
