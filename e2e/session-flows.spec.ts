import { expect, test, type Page } from '@playwright/test'

import { addToCart, loginViaApi, openApp } from './support/app'
import { api, mock, USERS } from './support/mock-api'

async function signInAgain(page: Page) {
  const password = page.getByLabel('Senha', { exact: true })
  await expect(password).toBeVisible()
  await page.getByRole('textbox', { name: 'E-mail' }).fill(USERS.ana.email)
  await password.fill(USERS.ana.password)
  await page.getByRole('button', { name: 'Entrar', exact: true }).first().click()
}

test.describe('sessão: expiração no meio do fluxo', () => {
  test('expira durante a navegação interna e retoma o pagamento após novo login @mobile', async ({
    page,
  }) => {
    await loginViaApi(page, 'ana', '/')
    await addToCart(page, 'emerald-ape-042', { auth: true })
    await openApp(page, '/carrinho')
    await expect(page.getByTestId('cart-total')).toBeVisible()
    await mock.expireSessions(page)

    await page.getByRole('button', { name: 'Conectar e finalizar' }).click()
    await expect(page).toHaveURL(/\/entrar\?.*expired=1/)
    expect(decodeURIComponent(new URL(page.url()).search)).toContain('redirect=/pagamento')
    await expect(page.getByText(/Sua sessão expirou/).first()).toBeVisible()

    await signInAgain(page)
    await expect(page).toHaveURL(/\/pagamento$/)
    await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeVisible()
  })

  test('expira durante a confirmação do pedido sem criar compra e preserva o carrinho @mobile', async ({
    page,
  }) => {
    await loginViaApi(page, 'ana', '/')
    await addToCart(page, 'emerald-ape-042', { auth: true })
    await openApp(page, '/pagamento')
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await expect(page.getByRole('button', { name: 'Confirmar e enviar' })).toBeEnabled()
    await mock.expireSessions(page)

    await page.getByRole('button', { name: 'Confirmar e enviar' }).click()
    await expect(page).toHaveURL(/\/entrar\?.*expired=1/)
    expect(decodeURIComponent(new URL(page.url()).search)).toContain('redirect=/pagamento')

    await signInAgain(page)
    await expect(page).toHaveURL(/\/pagamento$/)
    await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeEnabled()
    const orders = await api<{ items: unknown[] }>(page, '/api/orders', { auth: true })
    expect(orders.body.items).toHaveLength(0)
  })

  test('sessão vence pelo relógio e a navegação seguinte pede novo login @mobile', async ({
    page,
  }) => {
    await page.clock.install()
    await loginViaApi(page, 'ana', '/perfil')
    await expect(page.getByLabel('Nome de exibição')).toBeVisible()

    await page.clock.fastForward('31:00')
    await page.reload()
    await expect(page).toHaveURL(/\/entrar\?.*expired=1/)
    expect(decodeURIComponent(new URL(page.url()).search)).toContain('redirect=/perfil')
  })
})
