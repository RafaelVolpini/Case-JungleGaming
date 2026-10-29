import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ARTS = ['emerald', 'golden', 'ivory', 'sage']
const PREVIOUS_LADDER = [480, 960]
const DENSITIES = [1, 2]
const SLOTS = [
  { name: 'hero mobile (sage)', css: 58 },
  { name: 'carrinho', css: 70 },
  { name: 'miniatura e carrinho mobile', css: 100 },
  { name: 'hero mobile', css: 138 },
  { name: 'card mobile', css: 155 },
  { name: 'capa do detalhe mobile', css: 337 },
  { name: 'card desktop', css: 260 },
  { name: 'galeria desktop', css: 404 },
  { name: 'hero desktop', css: 450 },
  { name: 'ampliação', css: 720 },
]
const MAX_DROP = 0.016
const FLOOR = 0.97

const declared = readFileSync(join(ROOT, 'src', 'lib', 'format', 'image.ts'), 'utf8')
const widths = [
  ...(declared.match(/NFT_ART_WIDTHS = \[([^\]]+)\]/)?.[1] ?? '').matchAll(/\d+/g),
].map((match) => Number(match[0]))

function ssim(a, b, size) {
  const C1 = 6.5025
  const C2 = 58.5225
  const win = 8
  const step = 4
  let total = 0
  let count = 0
  for (let y = 0; y + win <= size; y += step) {
    for (let x = 0; x + win <= size; x += step) {
      let ma = 0
      let mb = 0
      for (let j = 0; j < win; j += 1) {
        for (let i = 0; i < win; i += 1) {
          const k = (y + j) * size + x + i
          ma += a[k]
          mb += b[k]
        }
      }
      ma /= win * win
      mb /= win * win
      let va = 0
      let vb = 0
      let cov = 0
      for (let j = 0; j < win; j += 1) {
        for (let i = 0; i < win; i += 1) {
          const k = (y + j) * size + x + i
          const da = a[k] - ma
          const db = b[k] - mb
          va += da * da
          vb += db * db
          cov += da * db
        }
      }
      const n = win * win - 1
      va /= n
      vb /= n
      cov /= n
      total += ((2 * ma * mb + C1) * (2 * cov + C2)) / ((ma * ma + mb * mb + C1) * (va + vb + C2))
      count += 1
    }
  }
  return total / count
}

const luma = async (input, size) =>
  sharp(input).resize(size, size, { fit: 'cover', kernel: 'lanczos3' }).greyscale().raw().toBuffer()

const pick = (ladder, needed) => ladder.find((width) => width >= needed) ?? ladder.at(-1)
const file = (art, width) => join(ROOT, 'public', 'nft', `${art}-${width}.webp`)

const failures = []
const missing = widths.flatMap((width) =>
  ARTS.filter((art) => !existsSync(file(art, width))).map((art) => `${art}-${width}.webp`),
)
if (widths.length === 0) failures.push('NFT_ART_WIDTHS não encontrado em src/lib/format/image.ts')
if (missing.length > 0) failures.push(`variantes ausentes: ${missing.join(', ')}`)

if (failures.length === 0) {
  let checked = 0
  let worst = 1
  for (const art of ARTS) {
    const source = join(ROOT, 'assets', 'nft-source', `${art}.webp`)
    for (const slot of SLOTS) {
      for (const density of DENSITIES) {
        const needed = Math.ceil(slot.css * density)
        const reference = await luma(source, needed)
        const chosen = pick(widths, needed)
        const next = ssim(reference, await luma(file(art, chosen), needed), needed)
        const previous = ssim(
          reference,
          await luma(file(art, pick(PREVIOUS_LADDER, needed)), needed),
          needed,
        )
        const drop = previous - next
        worst = Math.min(worst, next)
        checked += 1
        const changed = chosen !== pick(PREVIOUS_LADDER, needed)
        if (drop > MAX_DROP || (changed && next < FLOOR)) {
          failures.push(
            `${art} em "${slot.name}" ${density}x (${needed}px): SSIM ${next.toFixed(4)} contra ${previous.toFixed(4)} antes`,
          )
        }
      }
    }
  }
  console.log(`${checked} combinações verificadas; pior SSIM ${worst.toFixed(4)}`)
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(
  `Qualidade das artes dentro do limite: SSIM >= ${FLOOR} contra o original e queda <= ${MAX_DROP} frente à escada anterior, até 2x.`,
)
