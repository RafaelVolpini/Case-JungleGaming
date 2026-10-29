import { expect, test, type Page } from '@playwright/test'

import { addToCart, loginViaApi, openApp } from './support/app'
import { api, mock } from './support/mock-api'

const SLUG = 'emerald-ape-042'

type OrderSnapshot = { id: string; version: number; status: string }
type NftSnapshot = { id: string; version: number; editions: { id: string }[] }

async function placeOrderAndLeave(page: Page): Promise<string> {
  await loginViaApi(page, 'ana', '/')
  await addToCart(page, SLUG, { auth: true })
  await openApp(page, '/pagamento')
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await page.getByRole('button', { name: 'Confirmar e enviar' }).click()
  await expect(page.getByText('Aguardando a confirmação da rede')).toBeVisible()
  const orderId = new URL(page.url()).pathname.split('/').pop() ?? ''
  await expect.poll(() => mock.socketClients(page)).toBeGreaterThan(0)
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL(/localhost:\d+\/$/)
  return orderId
}

function orderEvent(orderId: string, overrides: Record<string, unknown>) {
  return {
    eventId: 'evento-pedido',
    resource: 'order',
    id: orderId,
    version: 999_999,
    at: new Date().toISOString(),
    status: 'declined',
    confirmedAt: null,
    declinedReason: 'Evento de outro usuário',
    ownerId: 'user-bruno',
    ...overrides,
  }
}

async function sentinelPriceEvent(page: Page, priceEth: string) {
  const { body: nft } = await api<NftSnapshot>(page, `/api/nfts/${SLUG}`)
  await mock.emit(page, 'nft.updated', {
    eventId: `sentinela-${priceEth}`,
    resource: 'nft',
    id: nft.id,
    version: nft.version + 100,
    at: new Date().toISOString(),
    priceEth,
    previousPriceEth: null,
    available: 10,
    editions: nft.editions.map((edition) => ({ id: edition.id, available: 10, priceEth })),
  })
}

test.describe('tempo real: pedidos', () => {
  test('evento de outro dono não bloqueia os eventos reais do pedido @mobile', async ({ page }) => {
    test.setTimeout(60_000)
    const orderId = await placeOrderAndLeave(page)

    await mock.emit(page, 'order.updated', orderEvent(orderId, {}))
    await expect(page.getByText('Seu pedido foi confirmado.')).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText('Evento de outro usuário')).toHaveCount(0)
  })

  test('pedido confirmado é terminal e ignora eventos posteriores @mobile', async ({ page }) => {
    test.setTimeout(60_000)
    const orderId = await placeOrderAndLeave(page)
    await expect(page.getByText('Seu pedido foi confirmado.')).toBeVisible({ timeout: 20_000 })

    const { body: order } = await api<OrderSnapshot>(page, `/api/orders/${orderId}`, {
      auth: true,
    })
    const { body: session } = await api<{ user: { id: string } }>(page, '/api/auth/session', {
      auth: true,
    })
    const reason = 'Pagamento estornado indevidamente'
    await mock.emit(
      page,
      'order.updated',
      orderEvent(orderId, {
        eventId: 'evento-regressao',
        version: order.version + 100,
        declinedReason: reason,
        ownerId: session.user.id,
      }),
    )
    await sentinelPriceEvent(page, '7.77')

    await expect(page.getByText('7.77 ETH').first()).toBeVisible()
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    )
    await expect(page.getByText(reason)).toHaveCount(0)
  })
})
