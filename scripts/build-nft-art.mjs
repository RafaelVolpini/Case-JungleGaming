import { mkdirSync, readdirSync, rmSync } from 'node:fs'
import { dirname, join, parse } from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = join(ROOT, 'assets', 'nft-source')
const OUTPUT = join(ROOT, 'public', 'nft')
const QUALITY_BY_WIDTH = { 160: 92, 240: 86, 320: 86, 480: 80, 720: 84, 960: 80 }
const WIDTHS = Object.keys(QUALITY_BY_WIDTH).map(Number)

rmSync(OUTPUT, { recursive: true, force: true })
mkdirSync(OUTPUT, { recursive: true })

for (const file of readdirSync(SOURCE)) {
  const { name } = parse(file)
  for (const width of WIDTHS) {
    const info = await sharp(join(SOURCE, file))
      .resize(width, width, { fit: 'cover', kernel: 'lanczos3' })
      .webp({ quality: QUALITY_BY_WIDTH[width], effort: 5 })
      .toFile(join(OUTPUT, `${name}-${width}.webp`))
    console.log(`${name}-${width}.webp  ${(info.size / 1024).toFixed(1)} KB`)
  }
}
