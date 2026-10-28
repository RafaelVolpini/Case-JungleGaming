import { Link } from '@tanstack/react-router'

import { EmptyState } from '@/components/feedback/empty-state'
import { buttonVariants } from '@/components/ui/button'

type CheckoutEmptyStateProps = {
  reason: 'no-wallet' | 'empty-cart'
}

export function CheckoutEmptyState({ reason }: CheckoutEmptyStateProps) {
  if (reason === 'no-wallet') {
    return (
      <EmptyState
        title="Cadastre uma carteira para continuar"
        description="Você precisa de ao menos uma carteira cadastrada para finalizar a compra."
        action={
          <Link to="/perfil/carteiras" className={buttonVariants({ size: 'lg' })}>
            Cadastrar carteira
          </Link>
        }
      />
    )
  }

  return (
    <EmptyState
      title="Seu carrinho está vazio"
      description="Adicione NFTs ao carrinho antes de finalizar a compra."
      action={
        <Link to="/" hash="catalogo" className={buttonVariants({ size: 'lg' })}>
          Explorar NFTs
        </Link>
      }
    />
  )
}
