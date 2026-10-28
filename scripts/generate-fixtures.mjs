import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SEED = 20261027
const TOTAL = 36

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
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const int = (min, max) => min + Math.floor(rand() * (max - min + 1))

const ADJECTIVES = [
  'Emerald', 'Sage', 'Neon', 'Cosmic', 'Violet', 'Ivory', 'Golden', 'Crimson',
  'Obsidian', 'Azure', 'Amber', 'Jade',
]
const NOUNS = [
  'Ape', 'Nomad', 'Vessel', 'Bloom', 'Baron', 'Beat', 'Signal', 'Oracle',
  'Relic', 'Cipher', 'Drift', 'Ember',
]
const COLLECTIONS = [
  'col-arte-digital', 'col-fotografia', 'col-musica', 'col-arte-3d',
  'col-colecionaveis', 'col-generativa', 'col-jogos', 'col-assinaturas',
  'col-utilidade',
]
const NETWORKS = ['ethereum', 'ethereum', 'ethereum', 'polygon', 'polygon', 'solana']
const TRAITS = [
  ['Fundo', ['Sálvia', 'Creme', 'Turquesa', 'Lavanda']],
  ['Acessório', ['Óculos', 'Chapéu', 'Fones', 'Corrente']],
  ['Pelagem', ['Castanha', 'Cinza', 'Dourada', 'Negra']],
  ['Expressão', ['Serena', 'Altiva', 'Curiosa', 'Impassível']],
]

const used = new Set()
const nfts = []

for (let i = 0; i < TOTAL; i++) {
  let name
  let tokenNumber
  do {
    tokenNumber = String(int(1, 999)).padStart(3, '0')
    name = `${pick(ADJECTIVES)} ${pick(NOUNS)} #${tokenNumber}`
  } while (used.has(name))
  used.add(name)

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const priceCents = int(2, 1230)
  const priceEth = (priceCents / 100).toFixed(2)

  const hasDiscount = i % 9 === 2
  const previousPriceEth = hasDiscount ? ((priceCents * 1.18) / 100).toFixed(2) : null

  const rarity = i % 18 === 5 ? 'legendary' : i % 6 === 3 ? 'rare' : 'common'

  const soldOut = i === 7 || i === 23
  const editionTotal = pick([10, 25, 50, 100])
  const editionCount = int(2, 3)

  const editions = Array.from({ length: editionCount }, (_, e) => {
    const index = e + 1
    return {
      id: `${slug}-ed-${index}`,
      label: `${index}/${editionTotal}`,
      index,
      total: editionTotal,
      available: soldOut ? 0 : int(0, 6),
      priceEth: ((priceCents * (1 + e * 0.04)) / 100).toFixed(2),
    }
  })

  if (!soldOut && editions.every((e) => e.available === 0)) {
    editions[0].available = 3
  }

  const attributes = TRAITS.map(([trait, values]) => ({ trait, value: pick(values) }))

  const listedAt = new Date(Date.UTC(2026, 8, 30) - i * 36e5 * 7).toISOString()

  const contractAddress =
    '0x' + Array.from({ length: 40 }, () => '0123456789abcdef'[int(0, 15)]).join('')

  nfts.push({
    id: `nft-${slug}`,
    slug,
    name,
    tokenId: `#${tokenNumber}`,
    description:
      'Peça única de uma coleção curada de arte digital. Cada edição é cunhada ' +
      'on-chain e acompanha procedência verificável e direitos de exibição.',
    collectionId: pick(COLLECTIONS),
    network: pick(NETWORKS),
    priceEth,
    previousPriceEth,
    rarity,
    editions,
    attributes,
    rating: { average: Number((3.8 + rand() * 1.2).toFixed(1)), count: int(4, 180) },
    contractAddress,
    copyright: 'Uso pessoal e exibição. Revenda permitida com royalties de 5%.',
    maxPerOrder: pick([3, 5, 10]),
    listedAt,
    favoritesCount: int(0, 240),
  })
}

const BACKDROPS = ['#C9D7C2', '#F0EDE2', '#CFE3DE', '#D8CEE9', '#E8DCC8']
const INKS = ['#D28A4C', '#2F5D4A', '#6B5B8A', '#8A5A3C', '#3F4A52']

function artwork(slug) {
  const seed = [...slug].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
  const r = mulberry32(seed)
  const p = (arr) => arr[Math.floor(r() * arr.length)]
  const bg = p(BACKDROPS)
  const shapes = []

  for (let i = 0; i < 5; i++) {
    const ink = p(INKS)
    const cx = Math.round(120 + r() * 360)
    const cy = Math.round(120 + r() * 360)
    const size = Math.round(60 + r() * 190)
    const opacity = (0.25 + r() * 0.5).toFixed(2)

    if (r() > 0.45) {
      shapes.push(
        `<circle cx="${cx}" cy="${cy}" r="${size}" fill="${ink}" opacity="${opacity}"/>`,
      )
    } else {
      const angle = Math.round(r() * 90)
      shapes.push(
        `<rect x="${cx - Math.round(size / 2)}" y="${cy - Math.round(size / 2)}" ` +
          `width="${size}" height="${size}" rx="${Math.round(size / 6)}" ` +
          `fill="${ink}" opacity="${opacity}" transform="rotate(${angle} ${cx} ${cy})"/>`,
      )
    }
  }

  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" ' +
    `height="600"><rect width="600" height="600" fill="${bg}"/>` +
    `<g>${shapes.join('')}</g></svg>`
  )
}

mkdirSync(join(ROOT, 'public', 'nft'), { recursive: true })
for (const nft of nfts) {
  writeFileSync(join(ROOT, 'public', 'nft', `${nft.slug}.svg`), artwork(nft.slug))
}

const header =
  '// GENERATED FILE - do not edit by hand.\n' +
  `// Produced by scripts/generate-fixtures.mjs (seed ${SEED}). Run \`npm run fixtures\`.\n\n` +
  "import type { NftSeed } from './types'\n\n" +
  'export const NFT_SEEDS: NftSeed[] = '

writeFileSync(
  join(ROOT, 'src', 'mocks', 'fixtures', 'nfts.generated.ts'),
  header + JSON.stringify(nfts, null, 2) + '\n',
)

console.log(`${nfts.length} NFTs -> src/mocks/fixtures/nfts.generated.ts`)
console.log(`${nfts.length} SVGs -> public/nft/`)
