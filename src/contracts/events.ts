import { z } from 'zod'

import { ethAmountSchema, timestampSchema, versionSchema } from './common'
import { orderStatusSchema } from './order'

const eventEnvelope = {
  eventId: z.string(),
  id: z.string(),
  version: versionSchema,
  at: timestampSchema,
}

export const nftUpdatedEventSchema = z.object({
  ...eventEnvelope,
  resource: z.literal('nft'),
  priceEth: ethAmountSchema,
  previousPriceEth: ethAmountSchema.nullable(),
  available: z.number().int().nonnegative(),
  editions: z.array(
    z.object({
      id: z.string(),
      available: z.number().int().nonnegative(),
      priceEth: ethAmountSchema,
    }),
  ),
})
export type NftUpdatedEvent = z.infer<typeof nftUpdatedEventSchema>

export const orderUpdatedEventSchema = z.object({
  ...eventEnvelope,
  resource: z.literal('order'),
  status: orderStatusSchema,
  confirmedAt: timestampSchema.nullable(),
  declinedReason: z.string().nullable(),
  ownerId: z.string(),
})
export type OrderUpdatedEvent = z.infer<typeof orderUpdatedEventSchema>

export const SOCKET_EVENTS = {
  nftUpdated: 'nft.updated',
  orderUpdated: 'order.updated',
  identify: 'session.identify',
} as const

export type ServerToClientEvents = {
  'nft.updated': (payload: NftUpdatedEvent) => void
  'order.updated': (payload: OrderUpdatedEvent) => void
}

export type ClientToServerEvents = {
  'session.identify': (payload: { userId: string | null }) => void
}
