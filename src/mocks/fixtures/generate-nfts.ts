import type { NftSeed } from './types'

const SEED = 20261027
const TOTAL = 239

const COLLECTION_COUNTS: Array<[string, number]> = [
  ['col-arte-digital', 33],
  ['col-fotografia', 12],
  ['col-musica', 65],
  ['col-arte-3d', 39],
  ['col-colecionaveis', 23],
  ['col-generativa', 17],
  ['col-jogos', 19],
  ['col-assinaturas', 13],
  ['col-utilidade', 18],
]

const NETWORK_COUNTS: Array<[NftSeed['network'], number]> = [
  ['ethereum', 101],
  ['polygon', 66],
  ['solana', 72],
]

type Art = NftSeed['art']

const ART_BY_ADJECTIVE: Record<string, Art> = {
  Emerald: 'emerald',
  Azure: 'emerald',
  Copper: 'emerald',
  Sage: 'sage',
  Cosmic: 'sage',
  Violet: 'sage',
  Lilac: 'sage',
  Neon: 'ivory',
  Ivory: 'ivory',
  Obsidian: 'ivory',
  Crimson: 'ivory',
  Golden: 'golden',
  Amber: 'golden',
  Solar: 'golden',
  Jade: 'golden',
}

const NOUNS = [
  'Ape',
  'Nomad',
  'Vessel',
  'Bloom',
  'Baron',
  'Beat',
  'Signal',
  'Oracle',
  'Relic',
  'Cipher',
  'Drift',
  'Ember',
  'Echo',
  'Muse',
  'Prism',
  'Atlas',
]

const SERIES = ['Kurio Apes', 'Kurio Nomads', 'Kurio Editions']

const EDITION_TIERS = [
  { label: '1/1', total: 1, multiplier: 1.6 },
  { label: '1/10', total: 10, multiplier: 1.25 },
  { label: '1/50', total: 50, multiplier: 1 },
  { label: 'ABERTA', total: 1000, multiplier: 0.8 },
]

const ACCESSORY_BY_ART: Record<Art, [string, string]> = {
  emerald: ['Óculos', 'Esmeralda'],
  sage: ['Chapéu', 'Roxo'],
  ivory: ['Brinco', 'Verde-escuro'],
  golden: ['Fones', 'Dourado'],
}

const RARITY_LABELS: Record<NftSeed['rarity'], string> = {
  common: 'Comum',
  rare: 'Raro',
  legendary: 'Lendário',
}

type Spec = {
  name: string
  token: string
  price: string
  previous?: string | null
  art: Art
  rarity: NftSeed['rarity']
  network?: NftSeed['network']
  series: string
  rating?: [number, number]
  contract?: string
  favorites: number
}

const FIGMA_NFTS: Spec[] = [
  {
    name: 'Emerald Ape',
    token: '042',
    price: '1.19',
    art: 'emerald',
    rarity: 'rare',
    network: 'ethereum',
    series: 'Kurio Apes',
    rating: [4.8, 19],
    contract: '0x7a42c9d81f3b60e5a2d74c1b8e09f35a6d2c19e8',
    favorites: 214,
  },
  {
    name: 'Sage Nomad',
    token: '009',
    price: '1.69',
    art: 'sage',
    rarity: 'common',
    series: 'Kurio Nomads',
    favorites: 180,
  },
  {
    name: 'Neon Vessel',
    token: '552',
    price: '1.99',
    previous: '2.29',
    art: 'ivory',
    rarity: 'rare',
    series: 'Kurio Editions',
    favorites: 160,
  },
  {
    name: 'Cosmic Bloom',
    token: '118',
    price: '1.29',
    art: 'sage',
    rarity: 'common',
    series: 'Kurio Apes',
    favorites: 120,
  },
  {
    name: 'Violet Nomad',
    token: '314',
    price: '1.39',
    art: 'sage',
    rarity: 'common',
    network: 'ethereum',
    series: 'Kurio Apes',
    favorites: 105,
  },
  {
    name: 'Ivory Baron',
    token: '088',
    price: '1.79',
    art: 'ivory',
    rarity: 'rare',
    network: 'ethereum',
    series: 'Kurio Apes',
    favorites: 142,
  },
  {
    name: 'Golden Beat',
    token: '207',
    price: '0.99',
    art: 'golden',
    rarity: 'common',
    series: 'Kurio Apes',
    favorites: 133,
  },
  {
    name: 'Golden Echo',
    token: '233',
    price: '0.59',
    art: 'golden',
    rarity: 'common',
    series: 'Kurio Nomads',
    favorites: 70,
  },
  {
    name: 'Golden Signal',
    token: '160',
    price: '0.39',
    art: 'golden',
    rarity: 'common',
    series: 'Kurio Apes',
    favorites: 96,
  },
]

const SOLD_OUT = new Set([13, 41, 97, 150])
const LISTED_AT_BASE = Date.UTC(2026, 8, 30, 12)
const HOUR_MS = 36e5
const DAY_MS = 24 * HOUR_MS
const LAUNCH_EVERY = 4
const RECENT_LAUNCH_STEP_HOURS = 2
const OLD_LAUNCH_AGE_DAYS = 30

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function launchedAtFor(index: number): string {
  const recent = index % LAUNCH_EVERY === 1
  const age = recent
    ? index * RECENT_LAUNCH_STEP_HOURS * HOUR_MS
    : OLD_LAUNCH_AGE_DAYS * DAY_MS + index * HOUR_MS
  return new Date(LISTED_AT_BASE - age).toISOString()
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function generateNftSeeds(): NftSeed[] {
  const rand = mulberry32(SEED)
  const pick = <T>(list: readonly T[]): T => list[Math.floor(rand() * list.length)] as T
  const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1))

  function shuffled<T>(list: T[]): T[] {
    const copy = [...list]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j] as T, copy[i] as T]
    }
    return copy
  }

  function expand<T>(counts: Array<[T, number]>): T[] {
    return shuffled(counts.flatMap(([value, count]) => Array<T>(count).fill(value)))
  }

  const collections = expand(COLLECTION_COUNTS)
  const networks = expand(NETWORK_COUNTS)
  FIGMA_NFTS.forEach((figma, index) => {
    if (!figma.network) return
    const match = networks.findIndex(
      (value, position) => position >= index && value === figma.network,
    )
    ;[networks[index], networks[match]] = [
      networks[match] as NftSeed['network'],
      networks[index] as NftSeed['network'],
    ]
  })

  const adjectives = Object.keys(ART_BY_ADJECTIVE)
  const usedNames = new Set(FIGMA_NFTS.map((item) => `${item.name} #${item.token}`))

  function priceFor(index: number): string {
    if (index === 9) return '0.02'
    if (index === 10) return '12.30'
    const cents = Math.round(Math.pow(rand(), 2.4) * 1228) + 2
    return (cents / 100).toFixed(2)
  }

  function buildSpec(index: number): Spec {
    const figma = FIGMA_NFTS[index]
    if (figma) return { ...figma }

    let name: string
    let token: string
    do {
      token = String(int(1, 999)).padStart(3, '0')
      name = `${pick(adjectives)} ${pick(NOUNS)}`
    } while (usedNames.has(`${name} #${token}`))
    usedNames.add(`${name} #${token}`)

    const adjective = name.split(' ')[0] as string
    const hasPrevious = index % 11 === 4
    const price = priceFor(index)

    return {
      name,
      token,
      price,
      previous: hasPrevious ? (Number(price) * 1.18).toFixed(2) : null,
      art: ART_BY_ADJECTIVE[adjective] as Art,
      rarity: index % 17 === 5 ? 'legendary' : index % 6 === 3 ? 'rare' : 'common',
      series: pick(SERIES),
      favorites: int(0, 240),
    }
  }

  function buildEditions(slug: string, basePrice: string, soldOut: boolean, isFigma: boolean) {
    return EDITION_TIERS.map((tier, position) => {
      const available = soldOut
        ? 0
        : isFigma
          ? ([2, 6, 12, 40][position] as number)
          : ([int(0, 1), int(0, 6), int(1, 12), int(5, 40)][position] as number)
      return {
        id: `${slug}-ed-${position + 1}`,
        label: tier.label,
        index: 1,
        total: tier.total,
        available,
        priceEth: (Number(basePrice) * tier.multiplier).toFixed(2),
      }
    })
  }

  const nfts: NftSeed[] = []

  for (let i = 0; i < TOTAL; i++) {
    const spec = buildSpec(i)
    const isFigma = i < FIGMA_NFTS.length
    const slug = slugify(`${spec.name} ${spec.token}`)
    const soldOut = SOLD_OUT.has(i)
    const [accessory, color] = ACCESSORY_BY_ART[spec.art]

    nfts.push({
      id: `nft-${slug}`,
      slug,
      name: `${spec.name} #${spec.token}`,
      tokenId: `#${spec.token}`,
      art: spec.art,
      series: spec.series,
      collectionId: collections[i] as string,
      network: networks[i] as NftSeed['network'],
      priceEth: spec.price,
      previousPriceEth: spec.previous ?? null,
      rarity: spec.rarity,
      editions: buildEditions(slug, spec.price, soldOut, isFigma),
      attributes: [
        { trait: 'Acessório', value: accessory },
        { trait: 'Cor', value: color },
        { trait: 'Raridade', value: RARITY_LABELS[spec.rarity] },
      ],
      rating: {
        average: spec.rating ? spec.rating[0] : Number((3.8 + rand() * 1.2).toFixed(1)),
        count: spec.rating ? spec.rating[1] : int(4, 180),
      },
      contractAddress:
        spec.contract ??
        '0x' + Array.from({ length: 40 }, () => '0123456789abcdef'[int(0, 15)]).join(''),
      maxPerOrder: isFigma ? 10 : pick([3, 5, 10]),
      listedAt: new Date(LISTED_AT_BASE - i * HOUR_MS * 7).toISOString(),
      launchedAt: launchedAtFor(i),
      favoritesCount: spec.favorites,
    })
  }

  return nfts
}
