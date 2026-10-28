import { EmptyState } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'
import { NftCard } from '@/components/nft/nft-card'
import { NftCardSkeleton } from '@/components/nft/nft-card-skeleton'
import { Pagination } from '@/components/shared/pagination'
import { Button } from '@/components/ui/button'
import { CATALOG_PER_PAGE } from '@/contracts/nft'

import { useCatalogFilters } from '../hooks/use-catalog-filters'
import { useCatalog } from '../hooks/use-catalog-queries'
import { CardActions } from './card-actions'

const gridClassName =
  'grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 md:gap-x-[34px] md:gap-y-[64px]'

function scrollToCatalog() {
  document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function CatalogGrid() {
  const { query, update, reset } = useCatalogFilters()
  const { data, error, isPending, isError, isPlaceholderData, refetch } = useCatalog(query)

  if (isPending) {
    return (
      <div className={gridClassName} aria-busy="true" aria-label="Carregando NFTs">
        {Array.from({ length: CATALOG_PER_PAGE }, (_, index) => (
          <NftCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (isError && !data) {
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
        description="Nenhum item corresponde aos filtros escolhidos. Ajuste ou limpe os filtros para ver mais obras."
        action={<Button onClick={reset}>Limpar filtros</Button>}
      />
    )
  }

  return (
    <>
      <p className="sr-only" role="status">
        {data.pagination.total} NFTs encontrados. Página {data.pagination.page} de{' '}
        {data.pagination.totalPages}.
      </p>
      <ul
        className={`${gridClassName} transition-opacity ${isPlaceholderData ? 'opacity-60' : ''}`}
        aria-busy={isPlaceholderData}
      >
        {data.items.map((nft, index) => (
          <li key={nft.id}>
            <NftCard nft={nft} priority={index < 3} actions={<CardActions nft={nft} />} />
          </li>
        ))}
      </ul>
      <Pagination
        className="mt-[78px]"
        page={data.pagination.page}
        totalPages={data.pagination.totalPages}
        onPageChange={(page) => {
          update({ page })
          scrollToCatalog()
        }}
      />
    </>
  )
}
