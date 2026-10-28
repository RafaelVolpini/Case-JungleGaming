import { Link } from '@tanstack/react-router'

import { EmptyState } from '@/components/feedback/empty-state'
import { buttonVariants } from '@/components/ui/button'

export function CartEmpty() {
  return (
    <EmptyState
      title="Seu carrinho está vazio"
      description="Explore o catálogo e adicione NFTs para começar sua coleção."
      action={
        <Link to="/" hash="catalogo" className={buttonVariants({ size: 'lg' })}>
          Explorar NFTs
        </Link>
      }
    />
  )
}
