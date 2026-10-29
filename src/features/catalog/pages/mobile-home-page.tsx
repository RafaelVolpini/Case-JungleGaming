import { lazy, Suspense, useEffect, useState } from 'react'

import { whenIdle } from '@/lib/when-idle'

import { ActiveFilters } from '../components/active-filters'
import { MobileCatalogGrid } from '../components/mobile/mobile-catalog-grid'
import { MobileFeedTabs } from '../components/mobile/mobile-feed-tabs'
import { MobileHeroBanner } from '../components/mobile/mobile-hero-banner'
import { MobileSearchBar } from '../components/mobile/mobile-search-bar'

const loadFilterSheet = () => import('../components/mobile/mobile-filter-sheet')
const MobileFilterSheet = lazy(() =>
  loadFilterSheet().then((module) => ({ default: module.MobileFilterSheet })),
)

export function MobileHomePage() {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filtersRequested, setFiltersRequested] = useState(false)

  useEffect(() => whenIdle(() => void loadFilterSheet(), 4000), [])

  function openFilters() {
    setFiltersRequested(true)
    setFiltersOpen(true)
  }

  return (
    <div className="px-6 pt-10">
      <MobileSearchBar onOpenFilters={openFilters} />
      <MobileHeroBanner />
      <section id="catalogo" aria-label="Catálogo de NFTs" className="scroll-mt-4">
        <h2 className="sr-only">Catálogo de NFTs</h2>
        <MobileFeedTabs />
        <ActiveFilters className="mt-4" />
        <MobileCatalogGrid />
      </section>
      {filtersRequested && (
        <Suspense fallback={null}>
          <MobileFilterSheet open={filtersOpen} onOpenChange={setFiltersOpen} />
        </Suspense>
      )}
    </div>
  )
}
