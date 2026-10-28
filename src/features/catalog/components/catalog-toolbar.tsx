import { ChevronDown } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FEED_TABS } from '@/content/home'
import { feedSchema, sortSchema, SORT_LABELS, type Sort } from '@/contracts/nft'

import { useCatalogFilters } from '../hooks/use-catalog-filters'

const tabClassName =
  'text-cream relative h-[23px] border-b-0 pb-1 text-[15px] leading-[19px] md:text-[15px] data-[state=active]:text-primary-light after:absolute after:top-[21px] after:left-0 after:h-0.5 after:w-[86%] after:bg-transparent data-[state=active]:after:bg-primary'

export function CatalogToolbar() {
  const { query, update } = useCatalogFilters()

  return (
    <div className="flex h-[50px] items-start justify-between gap-4">
      <Tabs
        value={query.feed}
        onValueChange={(value) => update({ feed: feedSchema.parse(value) })}
        className="min-w-0"
      >
        <TabsList aria-label="Tipo de listagem" className="gap-5 border-b-0">
          {FEED_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              aria-controls={undefined}
              className={tabClassName}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="text-cream flex shrink-0 items-center gap-0 pb-1.5 text-[15px] leading-[23px]">
        <span id="sort-label">Ordenar por:</span>
        <Select
          value={query.sort}
          onValueChange={(value) => update({ sort: sortSchema.parse(value) })}
        >
          <SelectTrigger
            aria-labelledby="sort-label"
            className="text-cream h-auto w-auto gap-0 border-0 p-0 text-[15px] leading-[23px] md:h-auto md:text-[15px]"
          >
            <SelectValue />
            <ChevronDown className="hidden" />
          </SelectTrigger>
          <SelectContent align="end">
            {(Object.keys(SORT_LABELS) as Sort[]).map((value) => (
              <SelectItem key={value} value={value}>
                {SORT_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
