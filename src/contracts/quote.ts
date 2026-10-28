import { z } from 'zod'

import { ethAmountSchema, timestampSchema, versionSchema } from './common'
import { cartTotalsSchema } from './cart'

export const quoteIssueSchema = z.object({
  code: z.enum([
    'PRICE_CHANGED',
    'AVAILABILITY_REDUCED',
    'SOLD_OUT',
    'COUPON_EXPIRED',
    'COUPON_INVALID',
  ]),
  itemId: z.string().optional(),
  message: z.string(),
  previousEth: ethAmountSchema.optional(),
  currentEth: ethAmountSchema.optional(),
  previousQuantity: z.number().int().nonnegative().optional(),
  currentQuantity: z.number().int().nonnegative().optional(),
})
export type QuoteIssue = z.infer<typeof quoteIssueSchema>

export const quoteSchema = z.object({
  id: z.string(),
  cartVersion: versionSchema,
  totals: cartTotalsSchema,
  issues: z.array(quoteIssueSchema),
  issuedAt: timestampSchema,
  expiresAt: timestampSchema,
})
export type Quote = z.infer<typeof quoteSchema>

export function isQuoteConfirmable(quote: Quote): boolean {
  return quote.issues.length === 0 && new Date(quote.expiresAt) > new Date()
}
