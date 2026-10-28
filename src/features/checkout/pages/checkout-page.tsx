import { useState } from 'react'

import { ErrorState } from '@/components/feedback/error-state'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useSession } from '@/features/auth/hooks/use-session'
import { useCart } from '@/features/cart/hooks/use-cart'
import { usePendingOrder } from '@/features/orders/hooks/use-pending-order'
import { useWallets } from '@/features/wallets/hooks/use-wallets'
import { useIsDesktop } from '@/lib/use-media-query'

import { CheckoutEmptyState } from '../components/checkout-empty-state'
import { CheckoutForm } from '../components/checkout-form'
import { MobileCheckout } from '../components/mobile/mobile-checkout'
import { OrderRecovery } from '../components/order-recovery'
import { PendingOrderNotice } from '../components/pending-order-notice'
import { MobileCheckoutHeader } from '../components/mobile/mobile-checkout-header'
import { useOrderAttempt } from '../hooks/use-order-attempt'
import { CheckoutSkeleton } from '../components/checkout-skeleton'
import { useQuote } from '../hooks/use-quote'

export function CheckoutPage() {
  const isDesktop = useIsDesktop()
  const { user } = useSession()
  const wallets = useWallets()
  const cart = useCart()
  const pending = usePendingOrder()
  const attempt = useOrderAttempt()
  const [selectedId, setSelectedId] = useState<string>()

  const list = wallets.data ?? []
  const wallet =
    list.find((candidate) => candidate.id === selectedId) ??
    list.find((candidate) => candidate.kind === 'primary') ??
    list[0]
  const quote = useQuote(wallet)

  const loading = wallets.isPending || cart.isPending || (Boolean(wallet) && quote.isPending)
  const failure = wallets.error ?? cart.error ?? quote.error
  const ready = !loading && !failure
  const emptyCart = cart.data?.items.length === 0

  return (
    <div className={isDesktop ? 'page-container pt-[28px]' : 'px-6 pt-8'}>
      {isDesktop ? (
        <Breadcrumbs
          items={[
            { label: 'Início', to: '/' },
            { label: 'Mercado', to: '/' },
            { label: 'Pagamento' },
          ]}
        />
      ) : (
        <MobileCheckoutHeader />
      )}

      {attempt && <OrderRecovery input={attempt.input} />}

      {pending && <PendingOrderNotice orderId={pending.id} />}

      <div className={isDesktop ? 'mt-[25px]' : 'mt-[21px]'}>
        {loading && !failure && <CheckoutSkeleton />}
        {failure && (
          <ErrorState
            error={failure}
            title="Não foi possível preparar o pagamento"
            onRetry={() => {
              void wallets.refetch()
              void cart.refetch()
              void quote.refetch()
            }}
          />
        )}
        {ready && list.length === 0 && <CheckoutEmptyState reason="no-wallet" />}
        {ready && list.length > 0 && emptyCart && <CheckoutEmptyState reason="empty-cart" />}
        {user &&
          wallet &&
          cart.data &&
          !emptyCart &&
          quote.data &&
          (isDesktop ? (
            <CheckoutForm
              key={wallet.id}
              user={user}
              wallet={wallet}
              wallets={list}
              cart={cart.data}
              quote={quote.data}
              onWalletChange={setSelectedId}
            />
          ) : (
            <MobileCheckout
              key={wallet.id}
              user={user}
              wallet={wallet}
              wallets={list}
              quote={quote.data}
              onWalletChange={setSelectedId}
            />
          ))}
      </div>
    </div>
  )
}
