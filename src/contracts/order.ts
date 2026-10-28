import { z } from 'zod'

import { ethAmountSchema, networkSchema, timestampSchema, versionSchema } from './common'
import { appliedCouponSchema, cartTotalsSchema } from './cart'
import { nftImageSchema } from './nft'

/** Header carrying the client-generated idempotency key on order creation. */
export const IDEMPOTENCY_HEADER = 'x-idempotency-key'

/** `confirmed` and `declined` are terminal — no event may move an order out of them. */
export const orderStatusSchema = z.enum(['pending', 'confirmed', 'declined'])
export type OrderStatus = z.infer<typeof orderStatusSchema>

/**
 * A frozen copy of what was bought. The receipt reads only from here, so later
 * catalog changes can never rewrite a past order's values.
 */
export const orderItemSchema = z.object({
  nftId: z.string(),
  nftSlug: z.string(),
  name: z.string(),
  tokenId: z.string(),
  image: nftImageSchema,
  edition: z.object({
    id: z.string(),
    label: z.string(),
    index: z.number().int().positive(),
    total: z.number().int().positive(),
  }),
  quantity: z.number().int().positive(),
  unitPriceEth: ethAmountSchema,
  subtotalEth: ethAmountSchema,
})
export type OrderItem = z.infer<typeof orderItemSchema>

export const orderSchema = z.object({
  id: z.string(),
  /** Simulated on-chain transaction hash, shown on the receipt. */
  reference: z.string(),
  status: orderStatusSchema,
  items: z.array(orderItemSchema).min(1),
  totals: cartTotalsSchema,
  coupon: appliedCouponSchema.nullable(),
  wallet: z.object({
    id: z.string(),
    label: z.string(),
    address: z.string(),
    network: networkSchema,
  }),
  /** Simulated block explorer link. */
  explorerUrl: z.string(),
  createdAt: timestampSchema,
  confirmedAt: timestampSchema.nullable(),
  declinedReason: z.string().nullable(),
  version: versionSchema,
})
export type Order = z.infer<typeof orderSchema>

/* -------------------------------------------------------------------------- */
/*  Requests                                                                   */
/* -------------------------------------------------------------------------- */

/** The "Perfil do colecionador" form on the checkout screen. */
export const collectorDetailsSchema = z.object({
  displayName: z.string().trim().min(1, 'Informe o nome de exibição'),
  email: z.email('E-mail inválido'),
  ensName: z.string().trim().optional(),
  note: z.string().trim().max(500, 'Máximo de 500 caracteres').optional(),
})
export type CollectorDetails = z.infer<typeof collectorDetailsSchema>

export const createOrderSchema = z.object({
  /** Orders are only accepted against a fresh, issue-free quote. */
  quoteId: z.string(),
  walletId: z.string(),
  network: networkSchema,
  collector: collectorDetailsSchema,
})
export type CreateOrderInput = z.infer<typeof createOrderSchema>
