import { eth } from '@/contracts/common'

import { COLLECTION_SEEDS } from '../fixtures/collections'
import { NFT_FIXTURE_REVISION, NFT_SEEDS } from '../fixtures/nfts.generated'
import { USER_SEEDS } from '../fixtures/users'
import { hashPassword } from './crypto'
import { SCHEMA_VERSION } from './store'
import type { MockDb, NftRecord, UserRecord, WalletRecord } from './types'

let hashedUsers: UserRecord[] | null = null

export async function prepareSeed(): Promise<void> {
  hashedUsers = await Promise.all(
    USER_SEEDS.map(async (seed) => {
      const passwordSalt = `${seed.id}-salt`
      return {
        id: seed.id,
        displayName: seed.displayName,
        username: seed.username,
        email: seed.email,
        passwordHash: await hashPassword(seed.password, passwordSalt),
        passwordSalt,
        ensName: seed.ensName,
        avatarEmoji: seed.avatarEmoji,
        createdAt: seed.createdAt,
      } satisfies UserRecord
    }),
  )
}

export function createSeed(): MockDb {
  if (!hashedUsers) {
    throw new Error('[mock-db] prepareSeed() must run before createSeed()')
  }

  let sequence = 0
  const nextVersion = () => (sequence += 1)

  const nfts: NftRecord[] = NFT_SEEDS.map((seed) => ({
    id: seed.id,
    slug: seed.slug,
    name: seed.name,
    tokenId: seed.tokenId,
    art: seed.art,
    series: seed.series,
    collectionId: seed.collectionId,
    network: seed.network,
    priceEth: eth(seed.priceEth),
    previousPriceEth: seed.previousPriceEth ? eth(seed.previousPriceEth) : null,
    rarity: seed.rarity,
    editions: seed.editions.map((edition) => ({
      id: edition.id,
      label: edition.label,
      index: edition.index,
      total: edition.total,
      available: edition.available,
      priceEth: eth(edition.priceEth),
    })),
    attributes: seed.attributes,
    rating: seed.rating,
    contractAddress: seed.contractAddress,
    maxPerOrder: seed.maxPerOrder,
    listedAt: seed.listedAt,
    favoritesCount: seed.favoritesCount,
    version: nextVersion(),
  }))

  const slugToId = new Map(nfts.map((nft) => [nft.slug, nft.id]))

  const wallets: WalletRecord[] = USER_SEEDS.flatMap((user) =>
    user.wallets.map((wallet) => ({
      ...wallet,
      ownerId: user.id,
      createdAt: user.createdAt,
    })),
  )

  const favorites: Record<string, string[]> = {}
  for (const user of USER_SEEDS) {
    favorites[user.id] = user.favoriteSlugs
      .map((slug) => slugToId.get(slug))
      .filter((id): id is string => id !== undefined)
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    fixtureRevision: NFT_FIXTURE_REVISION,
    collections: COLLECTION_SEEDS.map((collection) => ({ ...collection })),
    nfts,
    users: hashedUsers.map((user) => ({ ...user })),
    sessions: [],
    carts: [],
    favorites,
    orders: [],
    wallets,
    quotes: [],
    idempotency: [],
    sequence,
  }
}
