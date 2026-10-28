import { z } from 'zod'

import { ethAmountSchema, networkSchema, timestampSchema, versionSchema } from './common'
import { nftImageSchema } from './nft'

export const cartItemSchema = z.object({
  id: z.string(),
  nftId: z.string(),
  nftSlug: z.string(),
  name: z.string(),
  tokenId: z.string(),
  image: nftImageSchema,
  network: networkSchema,
  edition: z.object({
    id: z.string(),
    label: z.string(),
    index: z.number().int().positive(),
    total: z.number().int().positive(),
  }),
  quantity: z.number().int().positive(),
  unitPriceEth: ethAmountSchema,
  subtotalEth: ethAmountSchema,
  availableQuantity: z.number().int().nonnegative(),
  maxQuantity: z.number().int().nonnegative(),
})
export type CartItem = z.infer<typeof cartItemSchema>

export const appliedCouponSchema = z.object({
  code: z.string(),
  description: z.string(),
  discountEth: ethAmountSchema,
})
export type AppliedCoupon = z.infer<typeof appliedCouponSchema>

export const cartTotalsSchema = z.object({
  subtotalEth: ethAmountSchema,
  discountEth: ethAmountSchema,
  networkFeeEth: ethAmountSchema,
  totalEth: ethAmountSchema,
})
export type CartTotals = z.infer<typeof cartTotalsSchema>

export const cartSchema = z.object({
  id: z.string(),
  items: z.array(cartItemSchema),
  coupon: appliedCouponSchema.nullable(),
  totals: cartTotalsSchema,
  updatedAt: timestampSchema,
  version: versionSchema,
})
export type Cart = z.infer<typeof cartSchema>

export const addCartItemSchema = z.object({
  nftId: z.string(),
  editionId: z.string(),
  quantity: z.number().int().positive(),
})
export type AddCartItemInput = z.infer<typeof addCartItemSchema>

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
})
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>

export const applyCouponSchema = z.object({
  code: z.string().trim().min(1, 'Informe um código promocional'),
})
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>
