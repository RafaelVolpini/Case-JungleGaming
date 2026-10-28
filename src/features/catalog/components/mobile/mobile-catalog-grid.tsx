import { EmptyState } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'
import { NftCardSkeleton } from '@/components/nft/nft-card-skeleton'
import { Pagination } from '@/components/shared/pagination'
import { Button } from '@/components/ui/button'
import type { NftSummary } from '@/contracts/nft'

import { useCatalogFilters } from '../../hooks/use-catalog-filters'
import { useCatalog } from '../../hooks/use-catalog-queries'
import { MobileNftCard } from './mobile-nft-card'

const COLUMN = 'flex min-w-0 flex-1 flex-col gap-5'

function Columns({ items }: { items: NftSummary[] }) {
  const left = items.filter((_, index) => index % 2 === 0)
  const right = items.filter((_, index) => index % 2 === 1)

  return (
    <div className="flex gap-4">
      <ul className={COLUMN}>
        {left.map((nft, index) => (
          <li key={nft.id}>
            <MobileNftCard nft={nft} imageAlign="top" priority={index < 2} />
          </li>
        ))}
      </ul>
      <ul className={`${COLUMN} mt-8`}>
        {right.map((nft) => (
          <li key={nft.id}>
            <MobileNftCard nft={nft} imageAlign="bottom" />
          </li>
        ))}
      </ul>
    </div>
  )
}

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
      <Columns items={data.items} />
      <Pagination
        className="mt-8"
        page={data.pagination.page}
        totalPages={data.pagination.totalPages}
        onPageChange={(page) => update({ page })}
      />
    </div>
  )
}
