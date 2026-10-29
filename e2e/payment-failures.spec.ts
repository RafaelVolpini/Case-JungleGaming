import { expect, test, type Page } from '@playwright/test'

import { addToCart, loginViaApi } from './support/app'
import { api, mock } from './support/mock-api'

type Wallet = { id: string; network: string }
type Order = { id: string; status: string }

async function readyToPay(page: Page, slug = 'emerald-ape-042') {
  await loginViaApi(page, 'ana', '/')
  await addToCart(page, slug, { auth: true })
  await page.goto('/pagamento')
  await page.waitForLoadState('networkidle')
}

async function orders(page: Page): Promise<Order[]> {
  const { body } = await api<{ items: Order[] }>(page, '/api/orders', { auth: true })
  return body.items
}

test.describe('falhas de pagamento', () => {
  test('pagamento recusado preserva o carrinho e permite tentar novamente @mobile', async ({
    page,
  }) => {
    await readyToPay(page)
    await mock.scenario(page, { payment: 'decline' })

    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await page.getByRole('button', { name: 'Confirmar e enviar' }).click()
    await expect(page.getByText('Não foi possível concluir o pagamento')).toBeVisible({
      timeout: 20_000,
    })
    await expect(page.getByRole('link', { name: 'Tentar novamente' })).toBeVisible()

    await page.getByRole('link', { name: 'Voltar ao carrinho' }).click()
    await expect(page.getByText('Emerald Ape #042').first()).toBeVisible()
  })

  test('clique repetido cria um único pedido @mobile', async ({ page }) => {
    await readyToPay(page)
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await page.getByRole('button', { name: 'Confirmar e enviar' }).dblclick()
    await expect(page).toHaveURL(/\/pedido\//)
    expect(await orders(page)).toHaveLength(1)
  })

  test('mesma chave devolve o mesmo pedido e conteúdo diferente gera conflito', async ({
    page,
  }) => {
    await readyToPay(page)
    const wallets = await api<Wallet[]>(page, '/api/wallets', { auth: true })
    const wallet = wallets.body[0]!
    const quote = await api<{ id: string }>(page, '/api/quotes', {
      method: 'POST',
      auth: true,
      body: { walletId: wallet.id, network: wallet.network },
    })
    const collector = {
      displayName: 'Ana Ribeiro',
      username: 'anaribeiro',
      profileName: 'Ana Ribeiro',
      referralCode: 'KURIO-ANA',
      email: 'ana@kurio.test',
      ensSuffix: '.eth',
      secondaryWallet: '',
      note: '',
    }
    const body = { quoteId: quote.body.id, walletId: wallet.id, network: wallet.network, collector }
    const headers = { 'x-idempotency-key': 'chave-fixa-e2e' }

    const first = await api<Order>(page, '/api/orders', {
      method: 'POST',
      auth: true,
      body,
      headers,
    })
    const repeat = await api<Order>(page, '/api/orders', {
      method: 'POST',
      auth: true,
      body,
      headers,
    })
    const conflict = await api<{ error: { code: string } }>(page, '/api/orders', {
      method: 'POST',
      auth: true,
      body: { ...body, collector: { ...collector, note: 'outro conteúdo' } },
      headers,
    })

    expect(first.status).toBe(201)
    expect(repeat.body.id).toBe(first.body.id)
    expect(conflict.status).toBe(409)
    expect(conflict.body.error.code).toBe('CONFLICT')
    expect(await orders(page)).toHaveLength(1)
  })

  test('timeout após criar o pedido é recuperado com a mesma chave de idempotência @mobile', async ({
    page,
  }) => {
    test.setTimeout(75_000)
    await page.clock.install()
    await readyToPay(page)
    const keys: string[] = []
    page.on('request', (request) => {
      const isOrderCreation =
        request.method() === 'POST' && new URL(request.url()).pathname === '/api/orders'
      if (isOrderCreation) keys.push(request.headers()['x-idempotency-key'] ?? '')
    })
    await mock.scenario(page, { orderTimeout: true })

    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await page.getByRole('button', { name: 'Confirmar e enviar' }).click()
    await page.clock.fastForward(9_000)
    const recover = page.getByRole('button', { name: /Tentar novamente|Verificar pedido/ })
    await expect(recover).toBeVisible()
    await recover.click()

    await expect(page).toHaveURL(/\/pedido\//)
    await page.clock.fastForward(3_000)
    await expect(page.getByText('Seus NFTs agora estão na sua carteira')).toBeVisible({
      timeout: 25_000,
    })
    expect(keys).toHaveLength(2)
    expect(new Set(keys).size).toBe(1)
    expect(await orders(page)).toHaveLength(1)
  })

  test('cotação vencida pelo relógio bloqueia o envio até atualizar @mobile', async ({ page }) => {
    await page.clock.install()
    await readyToPay(page)
    const confirm = page.getByRole('button', { name: 'Confirmar compra' })
    await expect(confirm).toBeEnabled()

    await page.clock.fastForward('06:00')
    await expect(page.getByRole('alert').filter({ hasText: 'Sua cotação expirou' })).toBeVisible()
    await expect(confirm).toBeDisabled()

    await page.getByRole('button', { name: 'Atualizar cotação' }).click()
    await expect(confirm).toBeEnabled()
  })
})
