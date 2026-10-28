import { http, HttpResponse } from 'msw'

import { applyCouponSchema } from '@/contracts/cart'

import { projectCart } from '../../db/cart-projection'
import { touchCart } from '../../db/carts'
import { findCoupon, isCouponExpired } from '../../db/coupons'
import { mutate } from '../../db/store'
import { API } from '../constants'
import { errorResponse, validationError } from '../errors'
import { simulated } from '../network'
import { cartFor } from './context'

const applyCoupon = http.post(
  `${API}/cart/coupon`,
  simulated(async ({ request }) => {
    const parsed = applyCouponSchema.safeParse(await request.json().catch(() => ({})))
    if (!parsed.success) {
      return validationError('Informe um código promocional.', parsed.error.issues)
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

    return mutate(() => {
      const cart = cartFor(request)
      if (cart.items.length === 0) {
        return errorResponse('CONFLICT', 'Adicione itens antes de aplicar um cupom.')
      }
      cart.couponCode = coupon.code
      touchCart(cart)
      return HttpResponse.json(projectCart(cart))
    })
  }),
)

const removeCoupon = http.delete(
  `${API}/cart/coupon`,
  simulated(({ request }) =>
    mutate(() => {
      const cart = cartFor(request)
      cart.couponCode = null
      touchCart(cart)
      return HttpResponse.json(projectCart(cart))
    }),
  ),
)

export const couponHandlers = [applyCoupon, removeCoupon]
