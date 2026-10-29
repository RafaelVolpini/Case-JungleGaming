import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { useSession } from '@/features/auth/hooks/use-session'
import { useCart } from '@/features/cart/hooks/use-cart'
import { nftDetailQueryOptions } from '@/features/catalog/api/catalog-queries'
import { useCatalog } from '@/features/catalog/hooks/use-catalog-queries'
import { catalogSearch, resolveCatalogQuery } from '@/features/catalog/search'

export type TargetOption = { slug: string; name: string }

const DEFAULT_QUERY = resolveCatalogQuery(catalogSearch({}))
const DEFAULT_EDITION = '1/50'

export function useSimulatorTarget() {
  const { scope } = useSession()
  const cart = useCart()
  const catalog = useCatalog(DEFAULT_QUERY)
  const [chosen, setChosen] = useState<string | null>(null)
  const [edition, setEdition] = useState(DEFAULT_EDITION)

  const fromCart = (cart.data?.items ?? []).map((item) => ({ slug: item.nftSlug, name: item.name }))
  const fromCatalog = (catalog.data?.items ?? []).map((item) => ({
    slug: item.slug,
    name: item.name,
  }))
  const options = [...fromCart, ...fromCatalog].filter(
    (option, index, all) => all.findIndex((other) => other.slug === option.slug) === index,
  )
  const slug = chosen ?? options[0]?.slug ?? null
  const detail = useQuery({
    ...nftDetailQueryOptions(scope, slug ?? ''),
    enabled: slug !== null,
  })

  return {
    options,
    slug,
    edition,
    detail: detail.data,
    chooseNft: setChosen,
    chooseEdition: setEdition,
  }
}
