import { Link } from '@tanstack/react-router'

import { EmptyState } from '@/components/feedback/empty-state'
import { buttonVariants } from '@/components/ui/button'

export function NftNotFound() {
  return (
    <EmptyState
      title="NFT não encontrado"
      description="Este NFT não existe ou foi removido do mercado."
      action={
        <Link to="/" hash="catalogo" className={buttonVariants({ size: 'lg' })}>
          Explorar o catálogo
        </Link>
      }
    />
  )
}
