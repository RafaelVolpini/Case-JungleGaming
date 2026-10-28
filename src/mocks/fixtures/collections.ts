import type { Collection } from '@/contracts/nft'

export const COLLECTION_SEEDS = [
  { id: 'col-arte-digital', slug: 'arte-digital', name: 'Arte digital' },
  { id: 'col-fotografia', slug: 'fotografia', name: 'Fotografia' },
  { id: 'col-musica', slug: 'musica', name: 'Música' },
  { id: 'col-arte-3d', slug: 'arte-3d', name: 'Arte 3D' },
  { id: 'col-colecionaveis', slug: 'colecionaveis', name: 'Colecionáveis' },
  { id: 'col-generativa', slug: 'generativa', name: 'Generativa' },
  { id: 'col-jogos', slug: 'jogos', name: 'Jogos' },
  { id: 'col-assinaturas', slug: 'assinaturas', name: 'Assinaturas' },
  { id: 'col-utilidade', slug: 'utilidade', name: 'Utilidade' },
] as const satisfies ReadonlyArray<Omit<Collection, 'nftCount'>>

export type CollectionSeed = (typeof COLLECTION_SEEDS)[number]
export type CollectionId = CollectionSeed['id']
