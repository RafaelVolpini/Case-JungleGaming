import { z } from 'zod'

import {
  collectionSchema,
  featuredSchema,
  networkOptionSchema,
  nftDetailSchema,
  nftListResponseSchema,
  type CatalogQuery,
  type Collection,
  type Featured,
  type NetworkOption,
  type NftDetail,
  type NftListResponse,
} from '@/contracts/nft'
import { http } from '@/lib/http/client'
import { serializeCatalogParams } from '@/lib/url/catalog-params'

export async function fetchCatalog(
  query: CatalogQuery,
  signal?: AbortSignal,
): Promise<NftListResponse> {
  const params = Object.fromEntries(serializeCatalogParams(query))
  const { data } = await http.get('/nfts', { params, signal })
  return nftListResponseSchema.parse(data)
}

export async function fetchNftDetail(slug: string, signal?: AbortSignal): Promise<NftDetail> {
  const { data } = await http.get(`/nfts/${encodeURIComponent(slug)}`, { signal })
  return nftDetailSchema.parse(data)
}

export async function fetchCollections(signal?: AbortSignal): Promise<Collection[]> {
  const { data } = await http.get('/collections', { signal })
  return z.array(collectionSchema).parse(data)
}

export async function fetchNetworks(signal?: AbortSignal): Promise<NetworkOption[]> {
  const { data } = await http.get('/networks', { signal })
  return z.array(networkOptionSchema).parse(data)
}

export async function fetchFeatured(signal?: AbortSignal): Promise<Featured> {
  const { data } = await http.get('/featured', { signal })
  return featuredSchema.parse(data)
}
