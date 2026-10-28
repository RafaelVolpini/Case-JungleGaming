import {
  cartSchema,
  type AddCartItemInput,
  type ApplyCouponInput,
  type Cart,
  type UpdateCartItemInput,
} from '@/contracts/cart'
import { http } from '@/lib/http/client'

export async function fetchCart(signal?: AbortSignal): Promise<Cart> {
  const { data } = await http.get('/cart', { signal })
  return cartSchema.parse(data)
}

export async function addCartItem(input: AddCartItemInput): Promise<Cart> {
  const { data } = await http.post('/cart/items', input)
  return cartSchema.parse(data)
}

export async function updateCartItem(itemId: string, input: UpdateCartItemInput): Promise<Cart> {
  const { data } = await http.patch(`/cart/items/${itemId}`, input)
  return cartSchema.parse(data)
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  const { data } = await http.delete(`/cart/items/${itemId}`)
  return cartSchema.parse(data)
}

export async function applyCoupon(input: ApplyCouponInput): Promise<Cart> {
  const { data } = await http.post('/cart/coupon', input)
  return cartSchema.parse(data)
}

export async function removeCoupon(): Promise<Cart> {
  const { data } = await http.delete('/cart/coupon')
  return cartSchema.parse(data)
}
