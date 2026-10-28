import { EmptyState } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'
import { NftCardSkeleton } from '@/components/nft/nft-card-skeleton'
import { Pagination } from '@/components/shared/pagination'
import { Button } from '@/components/ui/button'

import { useCatalogFilters } from '../../hooks/use-catalog-filters'
import { useCatalog } from '../../hooks/use-catalog-queries'
import { MobileNftColumns } from './mobile-nft-columns'

export function MobileCatalogGrid() {
  const { query, update, reset } = useCatalogFilters()
  const { data, error, isPending, isPlaceholderData, refetch } = useCatalog(query)

  if (isPending && !error) {
    return (
      <div className="mt-4 grid grid-cols-2 gap-4" aria-busy="true" aria-label="Carregando NFTs">
        {Array.from({ length: 4 }, (_, index) => (
          <NftCardSkeleton key={index} />
        ))}
      </div>
    )
  }
  if (!data) {
    return (
      <ErrorState
        error={error}
        onRetry={() => void refetch()}
        title="Não foi possível carregar o catálogo"
      />
    )
  }
  if (data.items.length === 0) {
    return (
      <EmptyState
        title="Nenhum NFT encontrado"
        description="Ajuste ou limpe os filtros para ver mais obras."
        action={<Button onClick={reset}>Limpar filtros</Button>}
      />
    )
  }

  return (
    <div className={`mt-4 transition-opacity ${isPlaceholderData ? 'opacity-60' : ''}`}>
      <p className="sr-only" role="status">
        {data.pagination.total} NFTs encontrados. Página {data.pagination.page} de{' '}
        {data.pagination.totalPages}.
      </p>
      <MobileNftColumns items={data.items} />
      <Pagination
        className="mt-8"
        page={data.pagination.page}
        totalPages={data.pagination.totalPages}
        onPageChange={(page) => update({ page })}
      />
    </div>
  )
}
