import { z } from 'zod'

export const ethAmountSchema = z
  .string()
  .regex(/^\d+(\.\d{1,18})?$/, 'Valor em ETH deve ser decimal positivo')
  .brand<'EthAmount'>()

export type EthAmount = z.infer<typeof ethAmountSchema>

export function eth(value: string): EthAmount {
  return ethAmountSchema.parse(value)
}

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

export const apiErrorCodeSchema = z.enum([
  'VALIDATION_ERROR',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'COUPON_INVALID',
  'COUPON_EXPIRED',
  'QUOTE_STALE',
  'SERVER_ERROR',
])

export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>

export const apiErrorSchema = z.object({
  error: z.object({
    code: apiErrorCodeSchema,
    message: z.string(),
    fields: z.record(z.string(), z.string()).optional(),
  }),
})

export type ApiError = z.infer<typeof apiErrorSchema>

export const timestampSchema = z.iso.datetime()

export const versionSchema = z.number().int().nonnegative()

export const networkSchema = z.enum(['ethereum', 'polygon', 'solana'])
export type Network = z.infer<typeof networkSchema>

export const NETWORK_LABELS: Record<Network, string> = {
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  solana: 'Solana',
}
