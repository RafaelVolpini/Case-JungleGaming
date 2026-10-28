import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { EmptyState } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from '@/features/auth/hooks/use-session'
import { useCart } from '@/features/cart/hooks/use-cart'
import { usePendingOrder } from '@/features/orders/hooks/use-pending-order'
import { useWallets } from '@/features/wallets/hooks/use-wallets'

import { CheckoutForm } from '../components/checkout-form'
import { useQuote } from '../hooks/use-quote'

function CheckoutSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando pagamento"
      className="md:grid md:grid-cols-[762px_minmax(0,1fr)] md:gap-x-[33px]"
    >
      <div className="grid gap-x-[25px] gap-y-4 md:grid-cols-2">
        {Array.from({ length: 10 }, (_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
      <div className="mt-8 md:mt-0">
        <Skeleton className="h-[70px] w-full" />
        <Skeleton className="mt-3 h-[70px] w-full" />
        <Skeleton className="mt-6 h-32 w-full" />
        <Skeleton className="mt-6 h-11 w-full" />
      </div>
    </div>
  )
}

export function CheckoutPage() {
  const { user } = useSession()
  const wallets = useWallets()
  const cart = useCart()
  const pending = usePendingOrder()
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
    <div className="page-container pt-4 md:pt-[28px]">
      <Breadcrumbs
        items={[
          { label: 'Início', to: '/' },
          { label: 'Mercado', to: '/' },
          { label: 'Pagamento' },
        ]}
      />

      {pending && (
        <p
          role="status"
          className="border-primary text-cream mt-4 rounded-lg border px-4 py-3 text-sm"
        >
          Você tem um pedido em processamento.{' '}
          <Link
            to="/pedido/$orderId"
            params={{ orderId: pending.id }}
            className="text-primary-light underline underline-offset-4"
          >
            Acompanhar pedido
          </Link>
        </p>
      )}

      <div className="mt-[25px]">
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
        {ready && list.length === 0 && (
          <EmptyState
            title="Cadastre uma carteira para continuar"
            description="Você precisa de ao menos uma carteira cadastrada para finalizar a compra."
            action={
              <Link to="/perfil/carteiras" className={buttonVariants({ size: 'lg' })}>
                Cadastrar carteira
              </Link>
            }
          />
        )}
        {ready && list.length > 0 && emptyCart && (
          <EmptyState
            title="Seu carrinho está vazio"
            description="Adicione NFTs ao carrinho antes de finalizar a compra."
            action={
              <Link to="/" hash="catalogo" className={buttonVariants({ size: 'lg' })}>
                Explorar NFTs
              </Link>
            }
          />
        )}
        {user && wallet && cart.data && !emptyCart && quote.data && (
          <CheckoutForm
            key={wallet.id}
            user={user}
            wallet={wallet}
            wallets={list}
            cart={cart.data}
            quote={quote.data}
            onWalletChange={setSelectedId}
          />
        )}
      </div>
    </div>
  )
}
