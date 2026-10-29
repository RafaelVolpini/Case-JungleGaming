import { lazy, Suspense } from 'react'

import { useIsDesktop } from '@/lib/use-media-query'

const SiteHeader = lazy(() =>
  import('./header/site-header').then((module) => ({ default: module.SiteHeader })),
)
const SiteFooter = lazy(() =>
  import('./footer/site-footer').then((module) => ({ default: module.SiteFooter })),
)

function HeaderPlaceholder() {
  return (
    <div aria-hidden="true" className="border-primary/50 sticky top-0 z-40 h-[69px] border-b" />
  )
}

export function DesktopHeader() {
  const isDesktop = useIsDesktop()
  if (!isDesktop) return null

  return (
    <Suspense fallback={<HeaderPlaceholder />}>
      <SiteHeader />
    </Suspense>
  )
}

export function DesktopFooter() {
  const isDesktop = useIsDesktop()
  if (!isDesktop) return null

  return (
    <Suspense fallback={null}>
      <SiteFooter />
    </Suspense>
  )
}
