import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SEED = 20261027
const TOTAL = 239

const COLLECTION_COUNTS = [
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

const NETWORK_COUNTS = [
  ['ethereum', 101],
  ['polygon', 66],
  ['solana', 72],
]

const ART_BY_ADJECTIVE = {
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
  'Ape', 'Nomad', 'Vessel', 'Bloom', 'Baron', 'Beat', 'Signal', 'Oracle',
  'Relic', 'Cipher', 'Drift', 'Ember', 'Echo', 'Muse', 'Prism', 'Atlas',
]

const SERIES = ['Kurio Apes', 'Kurio Nomads', 'Kurio Editions']

const EDITION_TIERS = [
  { label: '1/1', total: 1, multiplier: 1.6 },
  { label: '1/10', total: 10, multiplier: 1.25 },
  { label: '1/50', total: 50, multiplier: 1 },
  { label: 'ABERTA', total: 1000, multiplier: 0.8 },
]

const ACCESSORY_BY_ART = {
  emerald: ['Óculos', 'Esmeralda'],
  sage: ['Chapéu', 'Roxo'],
  ivory: ['Brinco', 'Verde-escuro'],
  golden: ['Fones', 'Dourado'],
}

const FIGMA_NFTS = [
  { name: 'Emerald Ape', token: '042', price: '1.19', art: 'emerald', rarity: 'rare', network: 'ethereum', series: 'Kurio Apes', rating: [4.8, 19], contract: '0x7a42c9d81f3b60e5a2d74c1b8e09f35a6d2c19e8', favorites: 214 },
  { name: 'Sage Nomad', token: '009', price: '1.69', art: 'sage', rarity: 'common', series: 'Kurio Nomads', favorites: 180 },
  { name: 'Neon Vessel', token: '552', price: '1.99', previous: '2.29', art: 'ivory', rarity: 'rare', series: 'Kurio Editions', favorites: 160 },
  { name: 'Cosmic Bloom', token: '118', price: '1.29', art: 'sage', rarity: 'common', series: 'Kurio Apes', favorites: 120 },
  { name: 'Violet Nomad', token: '314', price: '1.39', art: 'sage', rarity: 'common', series: 'Kurio Nomads', favorites: 105 },
  { name: 'Ivory Baron', token: '088', price: '1.79', art: 'ivory', rarity: 'rare', series: 'Kurio Editions', favorites: 142 },
  { name: 'Golden Beat', token: '207', price: '0.99', art: 'golden', rarity: 'common', series: 'Kurio Apes', favorites: 133 },
  { name: 'Golden Echo', token: '233', price: '0.59', art: 'golden', rarity: 'common', series: 'Kurio Apes', favorites: 70 },
  { name: 'Golden Signal', token: '160', price: '0.39', art: 'golden', rarity: 'common', series: 'Kurio Apes', favorites: 96 },
]

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(SEED)
const pick = (list) => list[Math.floor(rand() * list.length)]
const int = (min, max) => min + Math.floor(rand() * (max - min + 1))

function shuffled(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function expand(counts) {
  return shuffled(counts.flatMap(([value, count]) => Array(count).fill(value)))
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const collections = expand(COLLECTION_COUNTS)
const networks = expand(NETWORK_COUNTS)
const ethereumIndex = networks.indexOf('ethereum')
;[networks[0], networks[ethereumIndex]] = [networks[ethereumIndex], networks[0]]

const SOLD_OUT = new Set([13, 41, 97, 150])
const adjectives = Object.keys(ART_BY_ADJECTIVE)
const usedNames = new Set(FIGMA_NFTS.map((item) => `${item.name} #${item.token}`))

function priceFor(index) {
  if (index === 9) return '0.02'
  if (index === 10) return '12.30'
  const cents = Math.round(Math.pow(rand(), 2.4) * 1228) + 2
  return (cents / 100).toFixed(2)
}

function buildSpec(index) {
  const figma = FIGMA_NFTS[index]
  if (figma) return { ...figma }

  let name
  let token
  do {
    token = String(int(1, 999)).padStart(3, '0')
    name = `${pick(adjectives)} ${pick(NOUNS)}`
  } while (usedNames.has(`${name} #${token}`))
  usedNames.add(`${name} #${token}`)

  const adjective = name.split(' ')[0]
  const hasPrevious = index % 11 === 4
  const price = priceFor(index)

  return {
    name,
    token,
    price,
    previous: hasPrevious ? (Number(price) * 1.18).toFixed(2) : null,
    art: ART_BY_ADJECTIVE[adjective],
    rarity: index % 17 === 5 ? 'legendary' : index % 6 === 3 ? 'rare' : 'common',
    series: pick(SERIES),
    favorites: int(0, 240),
  }
}

function buildEditions(slug, basePrice, soldOut, isFigma) {
  return EDITION_TIERS.map((tier, position) => {
    const available = soldOut
      ? 0
      : isFigma
        ? [2, 6, 12, 40][position]
        : [int(0, 1), int(0, 6), int(1, 12), int(5, 40)][position]
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

const nfts = []

for (let i = 0; i < TOTAL; i++) {
  const spec = buildSpec(i)
  const isFigma = i < FIGMA_NFTS.length
  const slug = slugify(`${spec.name} ${spec.token}`)
  const soldOut = SOLD_OUT.has(i)
  const [accessory, color] = ACCESSORY_BY_ART[spec.art]
  const rarityLabel = { common: 'Comum', rare: 'Raro', legendary: 'Lendário' }[spec.rarity]

  nfts.push({
    id: `nft-${slug}`,
    slug,
    name: `${spec.name} #${spec.token}`,
    tokenId: `#${spec.token}`,
    art: spec.art,
    series: spec.series,
    collectionId: collections[i],
    network: networks[i],
    priceEth: spec.price,
    previousPriceEth: spec.previous ?? null,
    rarity: spec.rarity,
    editions: buildEditions(slug, spec.price, soldOut, isFigma),
    attributes: [
      { trait: 'Acessório', value: accessory },
      { trait: 'Cor', value: color },
      { trait: 'Raridade', value: rarityLabel },
    ],
    rating: {
      average: spec.rating ? spec.rating[0] : Number((3.8 + rand() * 1.2).toFixed(1)),
      count: spec.rating ? spec.rating[1] : int(4, 180),
    },
    contractAddress:
      spec.contract ?? '0x' + Array.from({ length: 40 }, () => '0123456789abcdef'[int(0, 15)]).join(''),
    maxPerOrder: isFigma ? 10 : pick([3, 5, 10]),
    listedAt: new Date(Date.UTC(2026, 8, 30, 12) - i * 36e5 * 7).toISOString(),
    favoritesCount: spec.favorites,
  })
}

const output =
  "import type { NftSeed } from './types'\n\nexport const NFT_SEEDS: NftSeed[] = " +
  JSON.stringify(nfts, null, 2) +
  '\n'

writeFileSync(join(ROOT, 'src', 'mocks', 'fixtures', 'nfts.generated.ts'), output)

const byCollection = {}
const byNetwork = {}
for (const nft of nfts) {
  byCollection[nft.collectionId] = (byCollection[nft.collectionId] ?? 0) + 1
  byNetwork[nft.network] = (byNetwork[nft.network] ?? 0) + 1
}
console.log(`${nfts.length} NFTs`)
console.log('collections', JSON.stringify(byCollection))
console.log('networks', JSON.stringify(byNetwork))
