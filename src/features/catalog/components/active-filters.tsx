import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

import { useCatalogFilters } from '../hooks/use-catalog-filters'
import { useCollections } from '../hooks/use-catalog-queries'
import { CLEAR_ALL_FILTERS, describeActiveFilters } from '../lib/active-filters'

export function ActiveFilters({ className }: { className?: string }) {
  const { query, update } = useCatalogFilters()
  const { data: collections } = useCollections()
  const filters = describeActiveFilters(query, collections)
  if (filters.length === 0) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-2', className)}>
      <ul aria-label="Filtros ativos" className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <li key={filter.key}>
            <button
              type="button"
              aria-label={`Remover filtro ${filter.label}`}
              onClick={() => update(filter.clear)}
              className="bg-card text-cream hover:text-primary-light focus-visible:ring-ring flex items-center gap-1.5 rounded-full px-3 py-1 text-xs outline-none focus-visible:ring-2"
            >
              {filter.label}
              <X className="size-3" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => update(CLEAR_ALL_FILTERS)}
        className="text-primary-light focus-visible:ring-ring rounded-sm text-xs underline underline-offset-4 outline-none focus-visible:ring-2"
      >
        Limpar filtros
      </button>
    </div>
  )
}
