import { expect, test, type Page } from '@playwright/test'

import { addToCart, catalogCards, loginViaApi, openApp } from './support/app'
import { api, USERS } from './support/mock-api'

async function confirmPurchase(page: Page) {
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await page.getByRole('button', { name: 'Confirmar e enviar' }).click()
}

test.describe('compra completa', () => {
  test('do catálogo ao recibo confirmado @mobile', async ({ page, isMobile }) => {
    await openApp(page)
    await catalogCards(page).first().getByRole('link').first().click()
    await expect(page).toHaveURL(/\/nft\/[^/]+$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const name = (await page.getByRole('heading', { level: 1 }).innerText()).trim()

    await page
      .getByRole('button', { name: isMobile ? 'Comprar NFT' : 'COMPRAR', exact: true })
      .click()
    await expect(page).toHaveURL(/\/carrinho$/)
    await expect(
      page.getByRole('list', { name: 'Itens do carrinho' }).getByText(name),
    ).toBeVisible()

    await page.getByRole('button', { name: 'Conectar e finalizar' }).click()
    await expect(page).toHaveURL(/\/entrar\?.*redirect/)
    await page.getByRole('textbox', { name: 'E-mail' }).fill(USERS.ana.email)
    await page.getByLabel('Senha', { exact: true }).fill(USERS.ana.password)
    await page.getByRole('button', { name: 'Entrar', exact: true }).first().click()
    await expect(page).toHaveURL(/\/pagamento$/)

    await confirmPurchase(page)
    await expect(page).toHaveURL(/\/pedido\//)
    await expect(page.getByText('Aguardando a confirmação da rede')).toBeVisible()
    await expect(page.getByText('Seus NFTs agora estão na sua carteira')).toBeVisible({
      timeout: 20_000,
    })
    await expect(page.getByRole('link', { name: /Ver no Etherscan/ })).toBeVisible()
    await expect(page.getByText(name).first()).toBeVisible()

    await openApp(page, '/carrinho')
    await expect(page.getByText('Seu carrinho está vazio')).toBeVisible()
  })

  test('recibo sobrevive ao refresh e não aceita pedido de outro usuário @mobile', async ({
    page,
  }) => {
    await loginViaApi(page, 'ana', '/')
    const nft = await api<{ id: string; editions: { id: string; label: string }[] }>(
      page,
      '/api/nfts/golden-beat-207',
      { auth: true },
    )
    const edition = nft.body.editions.find((item) => item.label === '1/50')
    await api(page, '/api/cart/items', {
      method: 'POST',
      auth: true,
      body: { nftId: nft.body.id, editionId: edition?.id, quantity: 1 },
    })
    await openApp(page, '/pagamento')
    await confirmPurchase(page)
    await expect(page.getByText('Seus NFTs agora estão na sua carteira')).toBeVisible({
      timeout: 20_000,
    })
    const orderUrl = page.url()

    await page.reload()
    await expect(page.getByText('Seus NFTs agora estão na sua carteira')).toBeVisible()

    await api(page, '/api/auth/logout', { method: 'POST', auth: true })
    await page.evaluate(() => localStorage.removeItem('kurio:session-token'))
    await loginViaApi(page, 'bruno', new URL(orderUrl).pathname)
    await expect(
      page
        .getByText('Página não encontrada')
        .or(page.getByText(/não encontrad/i))
        .first(),
    ).toBeVisible()
  })

  test('abrir o pagamento sem pedido pendente não consulta a lista de pedidos @mobile', async ({
    page,
  }) => {
    await loginViaApi(page, 'ana', '/')
    await addToCart(page, 'golden-beat-207', { auth: true })
    const orderRequests: string[] = []
    page.on('request', (request) => {
      if (new URL(request.url()).pathname.replace(/\/$/, '') === '/api/orders') {
        orderRequests.push(request.url())
      }
    })

    await openApp(page, '/pagamento')
    await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeVisible()
    expect(orderRequests).toEqual([])
  })
})
