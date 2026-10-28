import type { Network } from '@/contracts/common'
import type { Quote } from '@/contracts/quote'
import { compareEth } from '@/lib/money/eth'

import { projectCartItems } from './cart-projection'
import { computeTotals } from './cart-totals'
import { getOrCreateCart } from './carts'
import { applyIssueFixes, detectIssues } from './quote-issues'
import { getDb, nextVersion } from './store'
import type { QuoteRecord } from './types'

const QUOTE_TTL_MS = 5 * 60 * 1000
const MAX_QUOTES_PER_OWNER = 20

type QuoteInput = { ownerId: string; walletId: string; network: Network }
type QuoteOutcome = { ok: true; quote: QuoteRecord } | { ok: false; reason: 'EMPTY_CART' }

export function latestQuote(ownerId: string): QuoteRecord | undefined {
  return getDb()
    .quotes.filter((quote) => quote.ownerId === ownerId)
    .at(-1)
}

export function findQuote(id: string): QuoteRecord | undefined {
  return getDb().quotes.find((quote) => quote.id === id)
}

export function createQuote(input: QuoteInput, { compare = true } = {}): QuoteOutcome {
  const db = getDb()
  const cart = getOrCreateCart(input.ownerId, null)
  const items = projectCartItems(cart)
  if (items.length === 0) return { ok: false, reason: 'EMPTY_CART' }

  const { totals } = computeTotals(items, cart.couponCode)
  const issuedAt = new Date()
  const quote: QuoteRecord = {
    id: `quote-${crypto.randomUUID().slice(0, 8)}`,
    ownerId: input.ownerId,
    cartVersion: cart.version,
    lines: items.map((item) => ({
      itemId: item.id,
      nftId: item.nftId,
      editionId: item.edition.id,
      quantity: item.quantity,
      unitPriceEth: item.unitPriceEth,
    })),
    ...totals,
    couponCode: cart.couponCode,
    walletId: input.walletId,
    network: input.network,
    issuedAt: issuedAt.toISOString(),
    expiresAt: new Date(issuedAt.getTime() + QUOTE_TTL_MS).toISOString(),
    issues: detectIssues(items, cart.couponCode, compare ? latestQuote(input.ownerId) : undefined),
  }

  db.quotes.push(quote)
  const owned = db.quotes.filter((candidate) => candidate.ownerId === input.ownerId)
  if (owned.length > MAX_QUOTES_PER_OWNER) {
    const stale = new Set(owned.slice(0, owned.length - MAX_QUOTES_PER_OWNER).map((q) => q.id))
    db.quotes = db.quotes.filter((candidate) => !stale.has(candidate.id))
  }
  return { ok: true, quote }
}

export function acknowledgeQuote(quote: QuoteRecord): QuoteOutcome {
  const cart = getOrCreateCart(quote.ownerId, null)
  applyIssueFixes(cart, quote.issues)
  nextVersion()
  return createQuote(
    { ownerId: quote.ownerId, walletId: quote.walletId, network: quote.network },
    { compare: false },
  )
}

export function projectQuote(quote: QuoteRecord): Quote {
  return {
    id: quote.id,
    cartVersion: quote.cartVersion,
    totals: {
      subtotalEth: quote.subtotalEth,
      discountEth: quote.discountEth,
      networkFeeEth: quote.networkFeeEth,
      totalEth: quote.totalEth,
    },
    issues: quote.issues,
    issuedAt: quote.issuedAt,
    expiresAt: quote.expiresAt,
  }
}

export function isQuoteStale(quote: QuoteRecord): string | null {
  if (new Date(quote.expiresAt) <= new Date()) return 'A cotação expirou. Atualize para continuar.'
  if (quote.issues.length > 0)
    return 'Há alterações pendentes na cotação. Revise antes de confirmar.'

  const cart = getOrCreateCart(quote.ownerId, null)
  if (cart.version !== quote.cartVersion) return 'O carrinho mudou desde a cotação.'

  const items = projectCartItems(cart)
  const drifted = items.some((item) => {
    const line = quote.lines.find((candidate) => candidate.itemId === item.id)
    return (
      !line ||
      compareEth(line.unitPriceEth, item.unitPriceEth) !== 0 ||
      item.quantity > item.availableQuantity
    )
  })
  return drifted ? 'Preço ou disponibilidade mudaram desde a cotação.' : null
}
