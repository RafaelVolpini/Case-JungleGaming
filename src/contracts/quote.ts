import { z } from 'zod'

import { ethAmountSchema, timestampSchema, versionSchema } from './common'
import { cartTotalsSchema } from './cart'

/**
 * Why a quote exists at all.
 *
 * Prices and stock move while the user is in checkout — that is the whole
 * point of the Socket.IO layer. The order endpoint therefore refuses anything
 * but a fresh quote, and the client must surface every `issue` and get an
 * explicit re-confirmation before retrying. This is what stops a purchase from
 * silently going through at a stale price.
 */
export const quoteIssueSchema = z.object({
  code: z.enum([
    'PRICE_CHANGED',
    'AVAILABILITY_REDUCED',
    'SOLD_OUT',
    'COUPON_EXPIRED',
    'COUPON_INVALID',
  ]),
  /** Cart item the issue refers to. Absent for cart-wide issues like coupons. */
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
  /** The cart version this quote was computed from. */
  cartVersion: versionSchema,
  totals: cartTotalsSchema,
  issues: z.array(quoteIssueSchema),
  issuedAt: timestampSchema,
  expiresAt: timestampSchema,
})
export type Quote = z.infer<typeof quoteSchema>

/** A quote with issues cannot be submitted until the user acknowledges them. */
export function isQuoteConfirmable(quote: Quote): boolean {
  return quote.issues.length === 0 && new Date(quote.expiresAt) > new Date()
}
