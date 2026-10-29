import { createHash } from 'node:crypto'

import { expect, test } from '@playwright/test'

import { generateNftSeeds } from '../src/mocks/fixtures/generate-nfts'
import { NFT_FIXTURE_REVISION } from '../src/mocks/fixtures/revision'

const REVISION_LENGTH = 12

test('revisão das fixtures acompanha a saída do gerador', () => {
  const hash = createHash('sha1').update(JSON.stringify(generateNftSeeds())).digest('hex')
  expect(hash.slice(0, REVISION_LENGTH)).toBe(NFT_FIXTURE_REVISION)
})
