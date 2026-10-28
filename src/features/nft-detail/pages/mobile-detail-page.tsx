import { ErrorState } from '@/components/feedback/error-state'
import { BackButton } from '@/components/shared/back-button'
import { Skeleton } from '@/components/ui/skeleton'
import { useNftDetail } from '@/features/catalog/hooks/use-catalog-queries'
import { ApiRequestError } from '@/lib/http/errors'

import { MobileNftDetail } from '../components/mobile/mobile-nft-detail'
import { NftNotFound } from '../components/nft-not-found'

export function MobileDetailPage({ slug }: { slug: string }) {
  const { data, error, isPending, refetch } = useNftDetail(slug)
  const notFound = error instanceof ApiRequestError && error.status === 404

  if (data) return <MobileNftDetail key={data.id} nft={data} />

  return (
    <div className="bg-card min-h-dvh px-7 pt-[23px]">
      <BackButton />
      {isPending && (
        <Skeleton aria-busy="true" className="mt-2 h-[326px] w-full rounded-t-[30px]" />
      )}
      {notFound && (
        <div className="mt-8">
          <NftNotFound />
        </div>
      )}
      {error && !notFound && (
        <div className="mt-8">
          <ErrorState
            error={error}
            onRetry={() => void refetch()}
            title="Não foi possível carregar este NFT"
          />
        </div>
      )}
    </div>
  )
}
