import { lazy, Suspense } from 'react'

import { useIsDesktop } from '@/lib/use-media-query'
import { usePageTitle } from '@/lib/use-page-title'

import { MobileHomePage } from './mobile-home-page'

const DesktopHomePage = lazy(() =>
  import('./desktop-home-page').then((module) => ({ default: module.DesktopHomePage })),
)

export function HomePage() {
  usePageTitle()
  const isDesktop = useIsDesktop()
  if (!isDesktop) return <MobileHomePage />

  return (
    <Suspense fallback={null}>
      <DesktopHomePage />
    </Suspense>
  )
}
