import type { CatalogQuery } from '@/contracts/nft'

export const GUEST_SCOPE = 'guest'

export const queryKeys = {
  session: ['session'] as const,

  catalog: {
    list: (scope: string, query: CatalogQuery) => ['catalog', scope, 'list', query] as const,
    detail: (scope: string, slug: string) => ['catalog', scope, 'detail', slug] as const,
    featured: (scope: string) => ['catalog', scope, 'featured'] as const,
    collections: ['catalog', 'collections'] as const,
    networks: ['catalog', 'networks'] as const,
  },

  favorites: {
    ids: (scope: string) => ['private', scope, 'favorites', 'ids'] as const,
  },

  cart: (scope: string) => ['private', scope, 'cart'] as const,
  quote: (scope: string) => ['private', scope, 'quote'] as const,

  orders: {
    detail: (scope: string, id: string) => ['private', scope, 'orders', id] as const,
    pending: (scope: string) => ['private', scope, 'orders', 'pending'] as const,
  },

  profile: (scope: string) => ['private', scope, 'profile'] as const,
  wallets: (scope: string) => ['private', scope, 'wallets'] as const,
} as const
