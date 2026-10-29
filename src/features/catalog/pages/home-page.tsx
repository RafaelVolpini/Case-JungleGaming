import { useIsDesktop } from '@/lib/use-media-query'

import { ActiveFilters } from '../components/active-filters'
import { CatalogGrid } from '../components/catalog-grid'
import { CatalogToolbar } from '../components/catalog-toolbar'
import { HeroSection } from '../components/hero/hero-section'
import { JournalSection } from '../components/journal-section'
import { PromoCards } from '../components/promo-cards'
import { FilterSidebar } from '../components/sidebar/filter-sidebar'
import { Spotlight } from '../components/spotlight'
import { MobileHomePage } from './mobile-home-page'
import { usePageTitle } from '@/lib/use-page-title'

export function HomePage() {
  usePageTitle()
  const isDesktop = useIsDesktop()
  if (!isDesktop) return <MobileHomePage />

  return (
    <>
      <HeroSection />
      <section
        id="catalogo"
        aria-label="Catálogo de NFTs"
        className="page-container mt-24 scroll-mt-24 md:grid md:grid-cols-[250px_1fr] md:gap-x-8 lg:grid-cols-[310px_1fr] lg:gap-x-[47px]"
      >
        <div className="hidden md:block">
          <FilterSidebar />
          <div className="mt-6">
            <Spotlight />
          </div>
        </div>
        <div className="min-w-0">
          <CatalogToolbar />
          <ActiveFilters className="mb-4" />
          <CatalogGrid />
        </div>
      </section>
      <PromoCards />
      <JournalSection />
    </>
  )
}
