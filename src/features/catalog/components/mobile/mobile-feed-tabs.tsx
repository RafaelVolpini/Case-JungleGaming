import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FEED_TABS } from '@/content/home'
import { feedSchema } from '@/contracts/nft'

import { useCatalogFilters } from '../../hooks/use-catalog-filters'

const TAB =
  'text-cream data-[state=active]:text-primary-light relative mb-0 min-h-6 border-b-0 px-0 pb-0 font-normal text-[length:min(14px,calc((100vw-60px)/22.6))] leading-6 data-[state=active]:font-bold data-[state=active]:after:bg-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5'

export function MobileFeedTabs() {
  const { query, update } = useCatalogFilters()

  return (
    <Tabs value={query.feed} onValueChange={(value) => update({ feed: feedSchema.parse(value) })}>
      <TabsList aria-label="Tipo de listagem" className="mt-6 gap-x-1.5 gap-y-1 border-b-0">
        {FEED_TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} aria-controls={undefined} className={TAB}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
