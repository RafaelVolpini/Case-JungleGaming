import { useState } from 'react'

import { EmptyState } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'
import { NftCard } from '@/components/nft/nft-card'
import { NftCardSkeleton } from '@/components/nft/nft-card-skeleton'
import { Pagination } from '@/components/shared/pagination'
import { buttonVariants } from '@/components/ui/button'
import { CardActions } from '@/features/catalog/components/card-actions'

import { useFavoriteList } from '../hooks/use-favorites'

const GRID = 'grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 md:gap-x-[34px] md:gap-y-[48px]'

export function FavoritesPage() {
  const [page, setPage] = useState(1)
  const { data, error, isPending, isPlaceholderData, refetch } = useFavoriteList(page)

  return (
    <section aria-labelledby="favorites-title">
      <h1 id="favorites-title" className="text-cream -mt-1 text-base leading-6 font-bold">
        Lista de interesse
      </h1>
      <div className="mt-6">
        {isPending && !error && (
          <div className={GRID} aria-busy="true" aria-label="Carregando favoritos">
            {Array.from({ length: 6 }, (_, index) => (
              <NftCardSkeleton key={index} />
            ))}
          </div>
        )}
        {error && !data && (
          <ErrorState
            error={error}
            onRetry={() => void refetch()}
            title="Não foi possível carregar seus favoritos"
          />
        )}
        {data && data.items.length === 0 && (
          <EmptyState
            title="Você ainda não favoritou nenhum NFT"
            description="Toque no coração de um NFT para guardá-lo aqui."
            action={
              <a href="/#catalogo" className={buttonVariants()}>
                Explorar o mercado
              </a>
            }
          />
        )}
        {data && data.items.length > 0 && (
          <>
            <ul className={`${GRID} ${isPlaceholderData ? 'opacity-60' : ''}`}>
              {data.items.map((nft) => (
                <li key={nft.id}>
                  <NftCard nft={nft} actions={<CardActions nft={nft} />} />
                </li>
              ))}
            </ul>
            <Pagination
              className="mt-10"
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </section>
  )
}
