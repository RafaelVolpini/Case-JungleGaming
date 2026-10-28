import { NETWORK_LABELS, type Network } from '@/contracts/common'

import { useCatalogFilters } from '../../hooks/use-catalog-filters'
import { useNetworks } from '../../hooks/use-catalog-queries'
import { FilterGroup } from './filter-group'
import { FilterOption } from './filter-option'

export function NetworkFilter() {
  const { data, isLoading } = useNetworks()
  const { query, update } = useCatalogFilters()

  function toggle(id: Network) {
    const next = query.networks.includes(id)
      ? query.networks.filter((value) => value !== id)
      : [...query.networks, id]
    update({ networks: next })
  }

  return (
    <FilterGroup title="Rede" isLoading={isLoading} skeletonRows={3}>
      {data?.map((network) => (
        <FilterOption
          key={network.id}
          label={NETWORK_LABELS[network.id]}
          count={network.nftCount}
          selected={query.networks.includes(network.id)}
          onToggle={() => toggle(network.id)}
        />
      ))}
    </FilterGroup>
  )
}
