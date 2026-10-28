import { expect, test, type Page } from '@playwright/test'

import { loginViaApi, openApp } from './support/app'
import { api } from './support/mock-api'

const VIEWPORT = { width: 1280, height: 600 }

async function expectDialogInsideViewport(page: Page) {
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect
    .poll(async () => {
      const box = await dialog.boundingBox()
      return box !== null && box.y >= 0 && box.y + box.height <= VIEWPORT.height + 0.5
    })
    .toBe(true)
}

test.describe('modais em telas baixas', () => {
  test.use({ viewport: VIEWPORT })

  test('login e cadastro cabem inteiros na tela', async ({ page }) => {
    await openApp(page, '/entrar')
    await expectDialogInsideViewport(page)

    await page.getByRole('link', { name: 'Crie uma conta' }).click()
    await expect(page).toHaveURL(/\/criar-conta/)
    await expect(page.getByRole('textbox', { name: 'Nome de usuário' })).toBeVisible()
    await expectDialogInsideViewport(page)

    await page.getByRole('link', { name: 'Entre', exact: true }).click()
    await expect(page).toHaveURL(/\/entrar/)
  })

  test('recibo do pedido cabe inteiro na tela', async ({ page }) => {
    await loginViaApi(page, 'ana', '/')
    const nft = await api<{ id: string; editions: { id: string; label: string }[] }>(
      page,
      '/api/nfts/sage-nomad-009',
      { auth: true },
    )
    for (const [label, quantity] of [
      ['1/50', 2],
      ['ABERTA', 9],
    ] as const) {
      const edition = nft.body.editions.find((item) => item.label === label)
      await api(page, '/api/cart/items', {
        method: 'POST',
        auth: true,
        body: { nftId: nft.body.id, editionId: edition?.id, quantity },
      })
    }

    await openApp(page, '/pagamento')
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await page.getByRole('button', { name: 'Confirmar e enviar' }).click()
    await expect(page.getByText('Seus NFTs agora estão na sua carteira')).toBeVisible({
      timeout: 20_000,
    })
    await expectDialogInsideViewport(page)
    await expect(page.getByRole('link', { name: /Ver no Etherscan/ })).toBeInViewport()
  })
})
