import { lazy, Suspense } from 'react'

import { useNftDetail } from '@/features/catalog/hooks/use-catalog-queries'
import { useIsDesktop } from '@/lib/use-media-query'
import { usePageTitle } from '@/lib/use-page-title'

import { MobileDetailPage } from './mobile-detail-page'

const DesktopDetailPage = lazy(() =>
  import('./desktop-detail-page').then((module) => ({ default: module.DesktopDetailPage })),
)

export function NftDetailPage({ slug }: { slug: string }) {
  const isDesktop = useIsDesktop()
  const { data } = useNftDetail(slug)
  usePageTitle(data?.name ?? 'NFT')
  if (!isDesktop) return <MobileDetailPage slug={slug} />

  return (
    <Suspense fallback={null}>
      <DesktopDetailPage slug={slug} />
    </Suspense>
  )
}
