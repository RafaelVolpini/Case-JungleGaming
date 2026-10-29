import { expect, test } from '@playwright/test'

import { addToCart, loginViaApi, openApp } from './support/app'
import { mock } from './support/mock-api'

const SLUG = 'emerald-ape-042'

test.describe('tempo real: preço e disponibilidade', () => {
  test('mudança de preço atualiza o resumo do carrinho via Socket.IO @mobile', async ({ page }) => {
    await openApp(page)
    await addToCart(page, SLUG, { quantity: 2 })
    await openApp(page, '/carrinho')
    const total = page.getByTestId('cart-total')
    await expect(total).toHaveText('2.396 ETH')

    await mock.changeNft(page, SLUG, { priceEth: '2.00' })
    await expect(page.getByText(/O preço de Emerald Ape #042 mudou/)).toBeVisible()
    await expect(total).toHaveText('4.016 ETH')
    await expect(page.getByTestId('cart-change-note')).toContainText('Subiu, era 1.19 ETH')
  })

  test('redução de disponibilidade é informada no carrinho @mobile', async ({ page }) => {
    await openApp(page)
    await addToCart(page, SLUG, { quantity: 3 })
    await openApp(page, '/carrinho')

    await mock.changeNft(page, SLUG, { edition: '1/50', available: 1 })
    await expect(page.getByText(/disponibilidade de Emerald Ape #042 foi reduzida/)).toBeVisible()
    await expect(page.getByTestId('cart-change-note')).toContainText('Restam 1')
  })

  test('checkout bloqueia a confirmação com cotação desatualizada até aceitar @mobile', async ({
    page,
  }) => {
    await loginViaApi(page, 'ana', '/')
    await addToCart(page, SLUG, { auth: true })
    await openApp(page, '/pagamento')
    const confirm = page.getByRole('button', { name: 'Confirmar compra' })
    await expect(confirm).toBeEnabled()

    await mock.changeNft(page, SLUG, { priceEth: '2.50' })
    await expect(page.getByRole('alert').filter({ hasText: 'o preço mudou' })).toBeVisible()
    await expect(confirm).toBeDisabled()

    await page.getByRole('button', { name: 'Aceitar alterações e atualizar' }).click()
    await expect(confirm).toBeEnabled()
    await confirm.click()
    await page.getByRole('button', { name: 'Confirmar e enviar' }).click()
    await expect(page.getByText('Seus NFTs agora estão na sua carteira')).toBeVisible({
      timeout: 20_000,
    })
    await expect(page.getByText('2.50 ETH').first()).toBeVisible()
  })

  test('o alerta da cotação persiste após eventos não relacionados e só some ao aceitar', async ({
    page,
  }) => {
    await loginViaApi(page, 'ana', '/')
    await addToCart(page, SLUG, { auth: true })
    await openApp(page, '/pagamento')
    const confirm = page.getByRole('button', { name: 'Confirmar compra' })
    const alert = page.getByRole('alert').filter({ hasText: 'o preço mudou' })

    await mock.changeNft(page, SLUG, { priceEth: '2.50' })
    await expect(alert).toBeVisible()

    const requoted = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        new URL(response.url()).pathname === '/api/quotes',
    )
    await mock.changeNft(page, 'golden-beat-207', { priceEth: '1.11' })
    await requoted

    await expect(alert).toBeVisible()
    await expect(confirm).toBeDisabled()

    await page.getByRole('button', { name: 'Aceitar alterações e atualizar' }).click()
    await expect(alert).toHaveCount(0)
    await expect(confirm).toBeEnabled()
  })

  test('preço alterado com o diálogo de confirmação aberto fecha o diálogo e exige novo aceite @mobile', async ({
    page,
  }) => {
    await loginViaApi(page, 'ana', '/')
    await addToCart(page, SLUG, { auth: true })
    await openApp(page, '/pagamento')
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    const dialog = page.getByRole('dialog')
    await expect(page.getByRole('button', { name: 'Confirmar e enviar' })).toBeEnabled()

    await mock.changeNft(page, SLUG, { priceEth: '3.00' })
    await expect(dialog).toBeHidden()
    const alert = page.getByRole('alert').filter({ hasText: 'o preço mudou' })
    await expect(alert).toBeVisible()
    await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeDisabled()

    await page.getByRole('button', { name: 'Aceitar alterações e atualizar' }).click()
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await page.getByRole('button', { name: 'Confirmar e enviar' }).click()
    await expect(page.getByText('Seus NFTs agora estão na sua carteira')).toBeVisible({
      timeout: 20_000,
    })
    await expect(page.getByText('3.00 ETH').first()).toBeVisible()
  })

  test('disponibilidade reduzida no checkout bloqueia, atualiza o total e libera após aceitar @mobile', async ({
    page,
  }) => {
    await loginViaApi(page, 'ana', '/')
    await addToCart(page, SLUG, { quantity: 2, auth: true })
    await openApp(page, '/pagamento')
    const total = page.getByTestId('checkout-total')
    await expect(total).toHaveText('2.396 ETH')
    const confirm = page.getByRole('button', { name: 'Confirmar compra' })
    await expect(confirm).toBeEnabled()

    await mock.changeNft(page, SLUG, { edition: '1/50', available: 1 })
    await expect(page.getByRole('alert').filter({ hasText: 'restam apenas 1' })).toBeVisible()
    await expect(confirm).toBeDisabled()

    await page.getByRole('button', { name: 'Aceitar alterações e atualizar' }).click()
    await expect(confirm).toBeEnabled()
    await expect(total).not.toHaveText('2.396 ETH')
  })
})
