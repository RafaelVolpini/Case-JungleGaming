import {
  orderSchema,
  IDEMPOTENCY_HEADER,
  type CreateOrderInput,
  type Order,
} from '@/contracts/order'
import { quoteSchema, type CreateQuoteInput, type Quote } from '@/contracts/quote'
import { http } from '@/lib/http/client'

export async function createQuoteRequest(
  input: CreateQuoteInput,
  signal?: AbortSignal,
): Promise<Quote> {
  const { data } = await http.post('/quotes', input, { signal })
  return quoteSchema.parse(data)
}

export async function acknowledgeQuoteRequest(quoteId: string): Promise<Quote> {
  const { data } = await http.post(`/quotes/${quoteId}/acknowledge`)
  return quoteSchema.parse(data)
}

export async function createOrderRequest(
  input: CreateOrderInput,
  idempotencyKey: string,
): Promise<Order> {
  const { data } = await http.post('/orders', input, {
    headers: { [IDEMPOTENCY_HEADER]: idempotencyKey },
  })
  return orderSchema.parse(data)
}

export async function fetchOrderRequest(orderId: string, signal?: AbortSignal): Promise<Order> {
  const { data } = await http.get(`/orders/${orderId}`, { signal })
  return orderSchema.parse(data)
}
