import { z } from 'zod'

/* -------------------------------------------------------------------------- */
/*  Money                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * ETH amounts travel as decimal strings and are never parsed into `number`:
 * 0.1 + 0.2 in binary floating point is not 0.3, and a marketplace cannot
 * round a price into existence. Arithmetic goes through `@/lib/money`.
 *
 * Branded so a plain string cannot be passed where an amount is expected.
 */
export const ethAmountSchema = z
  .string()
  .regex(/^\d+(\.\d{1,18})?$/, 'Valor em ETH deve ser decimal positivo')
  .brand<'EthAmount'>()

export type EthAmount = z.infer<typeof ethAmountSchema>

/** Builds an `EthAmount` from a literal, throwing on malformed input. */
export function eth(value: string): EthAmount {
  return ethAmountSchema.parse(value)
}

/* -------------------------------------------------------------------------- */
/*  Pagination                                                                 */
/* -------------------------------------------------------------------------- */

export const paginationSchema = z.object({
  page: z.number().int().positive(),
  perPage: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

export type Pagination = z.infer<typeof paginationSchema>

export function paginatedSchema<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    items: z.array(item),
    pagination: paginationSchema,
  })
}

/* -------------------------------------------------------------------------- */
/*  Errors                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Every non-2xx response shares this envelope. `code` is what the UI branches
 * on; `message` is user-facing copy; `fields` carries per-input messages so a
 * form can attach them to the right control.
 */
export const apiErrorCodeSchema = z.enum([
  'VALIDATION_ERROR', // 422 — malformed or rejected input
  'UNAUTHENTICATED', // 401 — missing or expired session
  'FORBIDDEN', // 403 — authenticated but not allowed
  'NOT_FOUND', // 404 — resource does not exist
  'CONFLICT', // 409 — availability, duplicate account, idempotency reuse
  'COUPON_INVALID', // 422 — unknown coupon code
  'COUPON_EXPIRED', // 422 — known but no longer valid
  'QUOTE_STALE', // 409 — price/availability moved since the quote
  'SERVER_ERROR', // 500 — transient failure, safe to retry
])

export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>

export const apiErrorSchema = z.object({
  error: z.object({
    code: apiErrorCodeSchema,
    message: z.string(),
    /** Field name -> message. Present on VALIDATION_ERROR. */
    fields: z.record(z.string(), z.string()).optional(),
  }),
})

export type ApiError = z.infer<typeof apiErrorSchema>

/* -------------------------------------------------------------------------- */
/*  Shared primitives                                                          */
/* -------------------------------------------------------------------------- */

/** ISO-8601 instant. */
export const timestampSchema = z.iso.datetime()

/**
 * Monotonic per-resource counter carried by both REST payloads and Socket.IO
 * events. The client discards any event whose version is not greater than the
 * version it already holds, which is what makes duplicate and out-of-order
 * events harmless.
 */
export const versionSchema = z.number().int().nonnegative()

export const networkSchema = z.enum(['ethereum', 'polygon', 'solana'])
export type Network = z.infer<typeof networkSchema>

export const NETWORK_LABELS: Record<Network, string> = {
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  solana: 'Solana',
}
