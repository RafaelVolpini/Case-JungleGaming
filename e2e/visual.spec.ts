import { expect, test, type Page } from '@playwright/test'

import { addToCart, loginViaApi, openApp, settleFrames, waitForImages } from './support/app'

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready)
  await waitForImages(page)
  await settleFrames(page)
}

test.describe('regressão visual @mobile', () => {
  test('início', async ({ page }) => {
    await openApp(page)
    await settle(page)
    await expect(page).toHaveScreenshot('inicio.png', { fullPage: true })
  })

  test('detalhe do NFT', async ({ page }) => {
    await openApp(page, '/nft/emerald-ape-042')
    await settle(page)
    await expect(page).toHaveScreenshot('detalhe.png', { fullPage: true })
  })

  test('carrinho', async ({ page }) => {
    await openApp(page)
    await addToCart(page, 'emerald-ape-042', { quantity: 2 })
    await addToCart(page, 'violet-nomad-314', { quantity: 1 })
    await addToCart(page, 'ivory-baron-088', { quantity: 3 })
    await openApp(page, '/carrinho')
    await expect(page.getByTestId('cart-total')).toBeVisible()
    await settle(page)
    await expect(page).toHaveScreenshot('carrinho.png', { fullPage: true })
  })

  test('pagamento', async ({ page }) => {
    await loginViaApi(page, 'ana', '/')
    await addToCart(page, 'emerald-ape-042', { quantity: 2, auth: true })
    await addToCart(page, 'violet-nomad-314', { quantity: 1, auth: true })
    await openApp(page, '/pagamento')
    await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeVisible()
    await settle(page)
    await expect(page).toHaveScreenshot('pagamento.png', { fullPage: true })
  })
})
