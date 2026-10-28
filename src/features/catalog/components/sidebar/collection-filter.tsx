import { useCatalogFilters } from '../../hooks/use-catalog-filters'
import { useCollections } from '../../hooks/use-catalog-queries'
import { FilterGroup } from './filter-group'
import { FilterOption } from './filter-option'

export function CollectionFilter() {
  const { data, isLoading } = useCollections()
  const { query, update } = useCatalogFilters()

  function toggle(id: string) {
    const next = query.collections.includes(id)
      ? query.collections.filter((value) => value !== id)
      : [...query.collections, id]
    update({ collections: next })
  }

  return (
    <FilterGroup title="Coleções" isLoading={isLoading} skeletonRows={9}>
      {data?.map((collection) => (
        <FilterOption
          key={collection.id}
          label={collection.name}
          count={collection.nftCount}
          selected={query.collections.includes(collection.id)}
          onToggle={() => toggle(collection.id)}
        />
      ))}
    </FilterGroup>
  )
}
