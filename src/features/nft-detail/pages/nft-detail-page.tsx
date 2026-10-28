import { ErrorState } from '@/components/feedback/error-state'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useNftDetail } from '@/features/catalog/hooks/use-catalog-queries'
import { ApiRequestError } from '@/lib/http/errors'
import { useIsDesktop } from '@/lib/use-media-query'

import { NftDetailContent } from '../components/nft-detail-content'
import { NftDetailSkeleton } from '../components/nft-detail-skeleton'
import { NftNotFound } from '../components/nft-not-found'
import { MobileDetailPage } from './mobile-detail-page'

export function NftDetailPage({ slug }: { slug: string }) {
  const isDesktop = useIsDesktop()
  return isDesktop ? <DesktopDetailPage slug={slug} /> : <MobileDetailPage slug={slug} />
}

function DesktopDetailPage({ slug }: { slug: string }) {
  const { data, error, isPending, refetch } = useNftDetail(slug)
  const notFound = error instanceof ApiRequestError && error.status === 404

  return (
    <div className="page-container pt-4 md:pt-[28px]">
      <Breadcrumbs
        items={[
          { label: 'Início', to: '/' },
          { label: 'Mercado', to: '/' },
        ]}
      />
      {isPending && (
        <div className="mt-2">
          <NftDetailSkeleton />
        </div>
      )}
      {notFound && (
        <div className="mt-8">
          <NftNotFound />
        </div>
      )}
      {error && !notFound && !data && (
        <div className="mt-8">
          <ErrorState
            error={error}
            onRetry={() => void refetch()}
            title="Não foi possível carregar este NFT"
          />
        </div>
      )}
      {data && <NftDetailContent key={data.id} nft={data} />}
    </div>
  )
}
