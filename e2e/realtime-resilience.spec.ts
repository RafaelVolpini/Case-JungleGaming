import { expect, test, type Page } from '@playwright/test'

import { addToCart, loginViaApi, openApp } from './support/app'
import { api, mock } from './support/mock-api'

const SLUG = 'emerald-ape-042'

type NftDetail = { id: string; version: number; editions: { id: string; label: string }[] }

async function nftEvent(page: Page, overrides: Record<string, unknown>) {
  const { body } = await api<NftDetail>(page, `/api/nfts/${SLUG}`)
  return {
    event: {
      eventId: 'evento-base',
      resource: 'nft',
      id: body.id,
      version: body.version + 50,
      at: new Date().toISOString(),
      priceEth: '3.33',
      previousPriceEth: '1.19',
      available: 10,
      editions: body.editions.map((edition) => ({
        id: edition.id,
        available: 10,
        priceEth: '3.33',
      })),
      ...overrides,
    },
    baseVersion: body.version,
  }
}

test.describe('tempo real: resiliência', () => {
  test('eventos duplicados ou antigos não regridem o estado', async ({ page }) => {
    await openApp(page, `/nft/${SLUG}`)
    await expect(page.getByText('1.19 ETH').first()).toBeVisible()
    await expect.poll(() => mock.socketClients(page)).toBeGreaterThan(0)

    const { event, baseVersion } = await nftEvent(page, { eventId: 'evento-novo' })
    await mock.emit(page, 'nft.updated', event)
    await expect(page.getByText('3.33 ETH').first()).toBeVisible()

    await mock.emit(page, 'nft.updated', event)
    await mock.emit(page, 'nft.updated', {
      ...event,
      eventId: 'evento-antigo',
      version: baseVersion + 1,
      priceEth: '0.10',
      editions: event.editions.map((edition) => ({ ...edition, priceEth: '0.10' })),
    })
    await page.waitForTimeout(600)
    await expect(page.getByText('3.33 ETH').first()).toBeVisible()
    await expect(page.getByText('0.10 ETH')).toHaveCount(0)
  })

  test('evento de pedido de outro usuário é ignorado e o pedido pendente é retomado após a queda', async ({
    page,
  }) => {
    test.setTimeout(60_000)
    await loginViaApi(page, 'ana', '/')
    await addToCart(page, SLUG, { auth: true })
    await openApp(page, '/pagamento')
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await page.getByRole('button', { name: 'Confirmar e enviar' }).click()
    await expect(page.getByText('Aguardando a confirmação da rede')).toBeVisible()
    const orderId = new URL(page.url()).pathname.split('/').pop() ?? ''

    await mock.emit(page, 'order.updated', {
      eventId: 'evento-estranho',
      resource: 'order',
      id: orderId,
      version: 999,
      at: new Date().toISOString(),
      status: 'declined',
      confirmedAt: null,
      declinedReason: 'Evento de outro usuário',
      ownerId: 'user-bruno',
    })
    await page.waitForTimeout(500)
    await expect(page.getByText('Evento de outro usuário')).toHaveCount(0)

    await mock.dropSocket(page)
    await page.reload()
    await expect(page.getByText('Seus NFTs agora estão na sua carteira')).toBeVisible({
      timeout: 25_000,
    })
    const orders = await api<{ items: unknown[] }>(page, '/api/orders', { auth: true })
    expect(orders.body.items).toHaveLength(1)
  })

  test('após a queda do socket o cliente reconecta e reconcilia', async ({ page }) => {
    await openApp(page, '/')
    await expect.poll(() => mock.socketClients(page)).toBeGreaterThan(0)
    await mock.dropSocket(page)
    await expect.poll(() => mock.socketClients(page), { timeout: 15_000 }).toBeGreaterThan(0)
  })
})
