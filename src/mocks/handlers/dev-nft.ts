import { http, HttpResponse } from 'msw'
import { z } from 'zod'

import { ethAmountSchema } from '@/contracts/common'
import { percentOfEth, roundEth } from '@/lib/money/eth'

import { findNftBySlug } from '../db/catalog'
import { mutateWith, nextVersion } from '../db/store'
import { EDITION_PRICE_MULTIPLIERS } from '../fixtures/editions'
import { API } from './constants'
import { errorResponse, validationError } from './errors'

const changeSchema = z.object({
  priceEth: ethAmountSchema.optional(),
  edition: z.string().optional(),
  available: z.number().int().nonnegative().optional(),
})

export const devNftHandlers = [
  http.post(`${API}/__mock__/nfts/:slug`, async ({ request, params }) => {
    const nft = findNftBySlug(String(params['slug']))
    if (!nft) return errorResponse('NOT_FOUND', 'NFT não encontrado.')

    const parsed = changeSchema.safeParse(await request.json().catch(() => ({})))
    if (!parsed.success) return validationError('Alteração inválida.', parsed.error.issues)
    const { priceEth, edition: editionLabel = '1/50', available } = parsed.data

    return mutateWith(() => {
      if (priceEth) {
        nft.previousPriceEth = nft.priceEth
        nft.priceEth = priceEth
        for (const edition of nft.editions) {
          const multiplier = EDITION_PRICE_MULTIPLIERS[edition.label] ?? 1
          edition.priceEth = roundEth(percentOfEth(priceEth, multiplier * 100), 2)
        }
      }
      if (available !== undefined) {
        const edition = nft.editions.find((candidate) => candidate.label === editionLabel)
        if (edition) edition.available = available
      }
      nft.version = nextVersion()
      return {
        result: HttpResponse.json({ id: nft.id, version: nft.version, priceEth: nft.priceEth }),
        events: [{ type: 'nft.updated' as const, nftId: nft.id }],
      }
    })
  }),
]
