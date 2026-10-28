import { useState } from 'react'

import { MobileCatalogGrid } from '../components/mobile/mobile-catalog-grid'
import { MobileFeedTabs } from '../components/mobile/mobile-feed-tabs'
import { MobileFilterSheet } from '../components/mobile/mobile-filter-sheet'
import { MobileHeroBanner } from '../components/mobile/mobile-hero-banner'
import { MobileSearchBar } from '../components/mobile/mobile-search-bar'

export function MobileHomePage() {
  const [filtersOpen, setFiltersOpen] = useState(false)

  return (
    <div className="px-6 pt-10">
      <MobileSearchBar onOpenFilters={() => setFiltersOpen(true)} />
      <MobileHeroBanner />
      <section id="catalogo" aria-label="Catálogo de NFTs" className="scroll-mt-4">
        <h2 className="sr-only">Catálogo de NFTs</h2>
        <MobileFeedTabs />
        <MobileCatalogGrid />
      </section>
      <MobileFilterSheet open={filtersOpen} onOpenChange={setFiltersOpen} />
    </div>
  )
}
