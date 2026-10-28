import { http, HttpResponse } from 'msw'

import { addCartItemSchema, applyCouponSchema, updateCartItemSchema } from '@/contracts/cart'

import { findNftById } from '../db/catalog'
import { findCoupon, getOrCreateCart, isCouponExpired, projectCart, touchCart } from '../db/carts'
import { mutate } from '../db/store'
import { API, errorResponse, fieldErrors, resolveCaller, simulateNetwork } from './helpers'

export const cartHandlers = [
  http.get(`${API}/cart`, async ({ request }) => {
    const failure = await simulateNetwork(request)
    if (failure) return failure

    const caller = resolveCaller(request)
    return mutate(() => {
      const cart = getOrCreateCart(caller.user?.id ?? null, caller.visitorId)
      return HttpResponse.json(projectCart(cart))
    })
  }),

  http.post(`${API}/cart/items`, async ({ request }) => {
    const failure = await simulateNetwork(request)
    if (failure) return failure

    const parsed = addCartItemSchema.safeParse(await request.json().catch(() => ({})))
    if (!parsed.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        'Não foi possível adicionar ao carrinho.',
        fieldErrors(parsed.error.issues),
      )
    }

    const { nftId, editionId, quantity } = parsed.data
    const nft = findNftById(nftId)
    if (!nft) return errorResponse('NOT_FOUND', 'Este NFT não existe.')

    const edition = nft.editions.find((candidate) => candidate.id === editionId)
    if (!edition) return errorResponse('NOT_FOUND', 'Esta edição não existe.')

    const caller = resolveCaller(request)

    return mutate(() => {
      const cart = getOrCreateCart(caller.user?.id ?? null, caller.visitorId)
      const existing = cart.items.find(
        (item) => item.nftId === nftId && item.editionId === editionId,
      )
      const desired = (existing?.quantity ?? 0) + quantity

      if (edition.available === 0) {
        return errorResponse('CONFLICT', 'Esta edição está esgotada.')
      }
      if (desired > edition.available) {
        return errorResponse(
          'CONFLICT',
          `Restam apenas ${edition.available} unidades desta edição.`,
        )
      }
      if (desired > nft.maxPerOrder) {
        return errorResponse(
          'CONFLICT',
          `Limite de ${nft.maxPerOrder} unidades por pedido.`,
        )
      }

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

  http.patch(`${API}/cart/items/:itemId`, async ({ request, params }) => {
    const failure = await simulateNetwork(request)
    if (failure) return failure

    const parsed = updateCartItemSchema.safeParse(await request.json().catch(() => ({})))
    if (!parsed.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        'Quantidade inválida.',
        fieldErrors(parsed.error.issues),
      )
    }

    const itemId = String(params['itemId'])
    const caller = resolveCaller(request)

    return mutate(() => {
      const cart = getOrCreateCart(caller.user?.id ?? null, caller.visitorId)
      const line = cart.items.find((item) => item.id === itemId)
      if (!line) return errorResponse('NOT_FOUND', 'Item não encontrado no carrinho.')

      const nft = findNftById(line.nftId)
      const edition = nft?.editions.find((candidate) => candidate.id === line.editionId)
      if (!nft || !edition) {
        return errorResponse('NOT_FOUND', 'Este NFT não está mais disponível.')
      }

      if (parsed.data.quantity > edition.available) {
        return errorResponse(
          'CONFLICT',
          `Restam apenas ${edition.available} unidades desta edição.`,
        )
      }
      if (parsed.data.quantity > nft.maxPerOrder) {
        return errorResponse('CONFLICT', `Limite de ${nft.maxPerOrder} unidades por pedido.`)
      }

      line.quantity = parsed.data.quantity
      touchCart(cart)
      return HttpResponse.json(projectCart(cart))
    })
  }),

  http.delete(`${API}/cart/items/:itemId`, async ({ request, params }) => {
    const failure = await simulateNetwork(request)
    if (failure) return failure

    const itemId = String(params['itemId'])
    const caller = resolveCaller(request)

    return mutate(() => {
      const cart = getOrCreateCart(caller.user?.id ?? null, caller.visitorId)
      const before = cart.items.length
      cart.items = cart.items.filter((item) => item.id !== itemId)
      if (cart.items.length === before) {
        return errorResponse('NOT_FOUND', 'Item não encontrado no carrinho.')
      }

      if (cart.items.length === 0) cart.couponCode = null

      touchCart(cart)
      return HttpResponse.json(projectCart(cart))
    })
  }),

  http.post(`${API}/cart/coupon`, async ({ request }) => {
    const failure = await simulateNetwork(request)
    if (failure) return failure

    const parsed = applyCouponSchema.safeParse(await request.json().catch(() => ({})))
    if (!parsed.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        'Informe um código promocional.',
        fieldErrors(parsed.error.issues),
      )
    }

    const coupon = findCoupon(parsed.data.code)
    if (!coupon) {
      return errorResponse('COUPON_INVALID', 'Código promocional inválido.', {
        code: 'Código promocional inválido.',
      })
    }
    if (isCouponExpired(coupon)) {
      return errorResponse('COUPON_EXPIRED', 'Este código promocional expirou.', {
        code: 'Este código promocional expirou.',
      })
    }

    const caller = resolveCaller(request)

    return mutate(() => {
      const cart = getOrCreateCart(caller.user?.id ?? null, caller.visitorId)
      if (cart.items.length === 0) {
        return errorResponse('CONFLICT', 'Adicione itens antes de aplicar um cupom.')
      }
      cart.couponCode = coupon.code
      touchCart(cart)
      return HttpResponse.json(projectCart(cart))
    })
  }),

  http.delete(`${API}/cart/coupon`, async ({ request }) => {
    const failure = await simulateNetwork(request)
    if (failure) return failure

    const caller = resolveCaller(request)

    return mutate(() => {
      const cart = getOrCreateCart(caller.user?.id ?? null, caller.visitorId)
      cart.couponCode = null
      touchCart(cart)
      return HttpResponse.json(projectCart(cart))
    })
  }),
]
