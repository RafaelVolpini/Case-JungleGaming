import { http, HttpResponse } from 'msw'

import { projectCart } from '../../db/cart-projection'
import { mutate } from '../../db/store'
import { API } from '../constants'
import { simulated } from '../network'
import { cartFor } from './context'
import { couponHandlers } from './coupon'
import { itemHandlers } from './items'

const getCart = http.get(
  `${API}/cart`,
  simulated(({ request }) => mutate(() => HttpResponse.json(projectCart(cartFor(request))))),
)

export const cartHandlers = [getCart, ...itemHandlers, ...couponHandlers]
