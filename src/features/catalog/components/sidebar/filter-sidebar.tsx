import { CollectionFilter } from './collection-filter'
import { NetworkFilter } from './network-filter'
import { PriceFilter } from './price-filter'

export function FilterSidebar() {
  return (
    <aside aria-label="Filtros do catálogo" className="bg-card px-5 pt-4 pb-5">
      <CollectionFilter />
      <div className="mt-9">
        <PriceFilter />
      </div>
      <div className="mt-9">
        <NetworkFilter />
      </div>
    </aside>
  )
}
