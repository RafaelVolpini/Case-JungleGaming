import { expect, test } from '@playwright/test'

import { addToCart, loginViaApi, openApp } from './support/app'
import { mock } from './support/mock-api'

const RECOVERY_TIMEOUT = 25_000

test.describe('falha de carregamento e nova tentativa', () => {
  test('detalhe do NFT mostra o erro e recupera na nova tentativa @mobile', async ({ page }) => {
    await page.goto('/nft/emerald-ape-042?failure=server-error&failScope=/api/nfts')
    const failure = page
      .getByRole('alert')
      .filter({ hasText: 'Não foi possível carregar este NFT' })
    await expect(failure).toBeVisible({ timeout: RECOVERY_TIMEOUT })

    await mock.scenario(page, { failure: 'none', scope: [] })
    await page.getByRole('button', { name: 'Tentar novamente' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Emerald Ape #042' })).toBeVisible()
  })

  test('carrinho mostra o erro e recupera na nova tentativa @mobile', async ({ page }) => {
    await openApp(page)
    await addToCart(page, 'emerald-ape-042')
    await mock.scenario(page, { failure: 'server-error', scope: ['/api/cart'] })
    await page.goto('/carrinho')
    const failure = page
      .getByRole('alert')
      .filter({ hasText: 'Não foi possível carregar o carrinho' })
    await expect(failure).toBeVisible({ timeout: RECOVERY_TIMEOUT })

    await mock.scenario(page, { failure: 'none', scope: [] })
    await page.getByRole('button', { name: 'Tentar novamente' }).click()
    await expect(page.getByTestId('cart-total')).toBeVisible()
  })

  test('pagamento mostra o erro e recupera na nova tentativa @mobile', async ({ page }) => {
    await loginViaApi(page, 'ana', '/')
    await addToCart(page, 'emerald-ape-042', { auth: true })
    await mock.scenario(page, { failure: 'server-error', scope: ['/api/quotes'] })
    await page.goto('/pagamento')
    const failure = page
      .getByRole('alert')
      .filter({ hasText: 'Não foi possível preparar o pagamento' })
    await expect(failure).toBeVisible({ timeout: RECOVERY_TIMEOUT })

    await mock.scenario(page, { failure: 'none', scope: [] })
    await page.getByRole('button', { name: 'Tentar novamente' }).click()
    await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeVisible()
  })
})
