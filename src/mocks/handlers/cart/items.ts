import { http, HttpResponse } from 'msw'

import { addCartItemSchema, updateCartItemSchema } from '@/contracts/cart'

import { projectCart } from '../../db/cart-projection'
import { touchCart } from '../../db/carts'
import { findNftById } from '../../db/catalog'
import { mutate } from '../../db/store'
import { API } from '../constants'
import { errorResponse, validationError } from '../errors'
import { simulated } from '../network'
import { cartFor } from './context'
import { quantityLimitError } from './limits'

const addItem = http.post(
  `${API}/cart/items`,
  simulated(async ({ request }) => {
    const parsed = addCartItemSchema.safeParse(await request.json().catch(() => ({})))
    if (!parsed.success) {
      return validationError('Não foi possível adicionar ao carrinho.', parsed.error.issues)
    }

    const { nftId, editionId, quantity } = parsed.data
    const nft = findNftById(nftId)
    if (!nft) return errorResponse('NOT_FOUND', 'Este NFT não existe.')
    const edition = nft.editions.find((candidate) => candidate.id === editionId)
    if (!edition) return errorResponse('NOT_FOUND', 'Esta edição não existe.')

    return mutate(() => {
      const cart = cartFor(request)
      const existing = cart.items.find(
        (item) => item.nftId === nftId && item.editionId === editionId,
      )
      const desired = (existing?.quantity ?? 0) + quantity

      const limitError = quantityLimitError(nft, edition, desired)
      if (limitError) return limitError

      if (existing) {
        existing.quantity = desired
      } else {
        cart.items.push({
          id: `ci-${crypto.randomUUID().slice(0, 8)}`,
          nftId,
          editionId,
          quantity,
          addedAt: new Date().toISOString(),
        })
      }

      touchCart(cart)
      return HttpResponse.json(projectCart(cart))
    })
  }),
)

const updateItem = http.patch(
  `${API}/cart/items/:itemId`,
  simulated(async ({ request, params }) => {
    const parsed = updateCartItemSchema.safeParse(await request.json().catch(() => ({})))
    if (!parsed.success) return validationError('Quantidade inválida.', parsed.error.issues)

    return mutate(() => {
      const cart = cartFor(request)
      const line = cart.items.find((item) => item.id === String(params['itemId']))
      if (!line) return errorResponse('NOT_FOUND', 'Item não encontrado no carrinho.')

      const nft = findNftById(line.nftId)
      const edition = nft?.editions.find((candidate) => candidate.id === line.editionId)
      if (!nft || !edition) {
        return errorResponse('NOT_FOUND', 'Este NFT não está mais disponível.')
      }

      const limitError = quantityLimitError(nft, edition, parsed.data.quantity)
      if (limitError) return limitError

      line.quantity = parsed.data.quantity
      touchCart(cart)
      return HttpResponse.json(projectCart(cart))
    })
  }),
)

const removeItem = http.delete(
  `${API}/cart/items/:itemId`,
  simulated(({ request, params }) =>
    mutate(() => {
      const cart = cartFor(request)
      const before = cart.items.length
      cart.items = cart.items.filter((item) => item.id !== String(params['itemId']))
      if (cart.items.length === before) {
        return errorResponse('NOT_FOUND', 'Item não encontrado no carrinho.')
      }

      if (cart.items.length === 0) cart.couponCode = null
      touchCart(cart)
      return HttpResponse.json(projectCart(cart))
    }),
  ),
)

export const itemHandlers = [addItem, updateItem, removeItem]
