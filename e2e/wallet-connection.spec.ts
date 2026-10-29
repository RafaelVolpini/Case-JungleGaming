import { expect, test, type Page } from '@playwright/test'

import { addToCart, loginViaApi, openApp } from './support/app'
import { mock } from './support/mock-api'

async function openConfirmation(page: Page) {
  await loginViaApi(page, 'ana', '/')
  await addToCart(page, 'golden-beat-207', { auth: true })
  await openApp(page, '/pagamento')
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
}

test.describe('carteira: conexão, recusa e desconexão', () => {
  test('a conexão é aceita, pode ser desconectada e reconectada @mobile', async ({ page }) => {
    await openConfirmation(page)
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Pronto para enviar o pedido com esta carteira.')).toBeVisible()

    await dialog.getByRole('button', { name: 'Desconectar' }).click()
    await expect(dialog.getByText(/Carteira desconectada/)).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Confirmar e enviar' })).toHaveCount(0)

    await dialog.getByRole('button', { name: 'Conectar novamente' }).click()
    await expect(dialog.getByText('Pronto para enviar o pedido com esta carteira.')).toBeVisible()
  })

  test('a carteira recusa a conexão e a nova tentativa conecta @mobile', async ({ page }) => {
    await loginViaApi(page, 'ana', '/')
    await addToCart(page, 'golden-beat-207', { auth: true })
    await openApp(page, '/pagamento')
    await mock.scenario(page, { wallet: 'reject' })
    await page.getByRole('button', { name: 'Confirmar compra' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('alert')).toContainText('A carteira recusou')
    await expect(dialog.getByRole('button', { name: 'Confirmar e enviar' })).toHaveCount(0)

    await mock.scenario(page, { wallet: 'accept' })
    await dialog.getByRole('button', { name: 'Conectar novamente' }).click()
    await expect(dialog.getByRole('button', { name: 'Confirmar e enviar' })).toBeEnabled()
  })
})
