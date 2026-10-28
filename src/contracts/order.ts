import { z } from 'zod'

import { ethAmountSchema, networkSchema, timestampSchema, versionSchema } from './common'
import { appliedCouponSchema, cartTotalsSchema } from './cart'
import { nftImageSchema } from './nft'
import { walletTypeSchema } from './wallet'

export const IDEMPOTENCY_HEADER = 'x-idempotency-key'

export const orderStatusSchema = z.enum(['pending', 'confirmed', 'declined'])
export type OrderStatus = z.infer<typeof orderStatusSchema>

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
    walletType: walletTypeSchema,
  }),
  explorerUrl: z.string(),
  createdAt: timestampSchema,
  confirmedAt: timestampSchema.nullable(),
  declinedReason: z.string().nullable(),
  version: versionSchema,
})
export type Order = z.infer<typeof orderSchema>

export const collectorDetailsSchema = z.object({
  displayName: z.string().trim().min(1, 'Informe o nome de exibição'),
  username: z.string().trim().min(3, 'Mínimo de 3 caracteres'),
  profileName: z.string().trim().min(1, 'Informe o nome do perfil'),
  referralCode: z.string().trim().min(1, 'Informe o código de indicação'),
  email: z.email('E-mail inválido'),
  ensSuffix: z.string().min(1, 'Selecione o domínio ENS'),
  secondaryWallet: z.string().trim().optional(),
  note: z.string().trim().max(500, 'Máximo de 500 caracteres').optional(),
})
export type CollectorDetails = z.infer<typeof collectorDetailsSchema>

export const createOrderSchema = z.object({
  quoteId: z.string(),
  walletId: z.string(),
  network: networkSchema,
  collector: collectorDetailsSchema,
})
export type CreateOrderInput = z.infer<typeof createOrderSchema>
