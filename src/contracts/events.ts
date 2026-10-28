import { z } from 'zod'

import { ethAmountSchema, timestampSchema, versionSchema } from './common'
import { orderStatusSchema } from './order'

/**
 * Every event carries a stable identity, the affected resource and a version.
 * The client keeps the highest version it has seen per resource and drops
 * anything not strictly greater, which makes duplicates and out-of-order
 * delivery no-ops instead of regressions.
 */
const eventEnvelope = {
  /** Unique per emission — distinct from the resource id, used for dedupe logs. */
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
  /**
   * Scopes the event to its owner. The client ignores events whose owner is
   * not the signed-in user, so a stale socket from a previous session can
   * never write into another user's cache.
   */
  ownerId: z.string(),
})
export type OrderUpdatedEvent = z.infer<typeof orderUpdatedEventSchema>

export const SOCKET_EVENTS = {
  nftUpdated: 'nft.updated',
  orderUpdated: 'order.updated',
  identify: 'session.identify',
} as const

/** Typed event maps consumed by `io<ServerToClient, ClientToServer>()`. */
export type ServerToClientEvents = {
  'nft.updated': (payload: NftUpdatedEvent) => void
  'order.updated': (payload: OrderUpdatedEvent) => void
}

export type ClientToServerEvents = {
  /** Re-sent on every connect and on user change, so the server can scope events. */
  'session.identify': (payload: { userId: string | null }) => void
}
