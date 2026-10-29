import { expect, test, type Page } from '@playwright/test'

import { addToCart, loginViaApi, openApp } from './support/app'
import { api } from './support/mock-api'

const SLUG = 'emerald-ape-042'

const simulator = (page: Page) => page.getByRole('complementary', { name: 'Simulador de mercado' })

async function openSimulator(page: Page, path: string) {
  await openApp(page, `${path}?simulador=1`)
  await expect(simulator(page)).toBeVisible()
  await expect(simulator(page).getByTestId('simulator-live')).toBeVisible()
}

test.describe('simulador de mercado', () => {
  test('fica oculto por padrão e abre pelo atalho ou pelo parâmetro @mobile', async ({ page }) => {
    await openApp(page)
    await expect(simulator(page)).toHaveCount(0)

    await page.keyboard.press('Control+Alt+m')
    await expect(simulator(page)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(simulator(page)).toHaveCount(0)

    await openApp(page, '/?simulador=1')
    await expect(simulator(page)).toBeVisible()
    await simulator(page).getByRole('button', { name: 'Fechar simulador' }).click()
    await expect(simulator(page)).toHaveCount(0)
  })

  test('mudar o preço pelo painel atualiza o carrinho aberto via Socket.IO @mobile', async ({
    page,
  }) => {
    await openApp(page)
    await addToCart(page, SLUG, { quantity: 2 })
    await openSimulator(page, '/carrinho')
    const total = page.getByTestId('cart-total')
    await expect(total).toHaveText('2.396 ETH')

    await simulator(page).getByRole('button', { name: 'Alterar o preço em +10%' }).click()
    await expect(page.getByText(/O preço de Emerald Ape #042 mudou/)).toBeVisible()
    await expect(total).not.toHaveText('2.396 ETH')
    await expect(simulator(page).getByTestId('simulator-live')).toContainText('1.31 ETH')
  })

  test('mudar o preço pelo painel bloqueia o checkout até aceitar @mobile', async ({ page }) => {
    await loginViaApi(page, 'ana', '/')
    await addToCart(page, SLUG, { auth: true })
    await openSimulator(page, '/pagamento')
    const confirm = page.getByRole('button', { name: 'Confirmar compra' })
    await expect(confirm).toBeEnabled()

    await simulator(page).getByRole('button', { name: 'Alterar o preço em +10%' }).click()
    await expect(page.getByRole('alert').filter({ hasText: 'o preço mudou' })).toBeVisible()
    await expect(confirm).toBeDisabled()

    await page.getByRole('button', { name: 'Aceitar alterações e atualizar' }).click()
    await expect(confirm).toBeEnabled()
  })

  test('eventos duplicado e antigo são reenviados e ignorados pelo app @mobile', async ({
    page,
  }) => {
    await openSimulator(page, `/nft/${SLUG}`)
    const panel = simulator(page)
    const status = panel.getByRole('status')

    await panel.getByRole('button', { name: 'Evento duplicado' }).click()
    await expect(status).toContainText('Altere o preço ou a disponibilidade primeiro')

    await panel.getByRole('button', { name: 'Alterar o preço em +5%' }).click()
    await expect(panel.getByTestId('simulator-live')).toContainText('1.25 ETH')
    await panel.getByRole('button', { name: 'Evento duplicado' }).click()
    await expect(status).toContainText('mesmo evento reenviado')
    await panel.getByRole('button', { name: 'Evento antigo' }).click()
    await expect(status).toContainText('evento anterior reenviado')
    await expect(panel.getByTestId('simulator-live')).toContainText('1.25 ETH')
  })

  test('queda com retenção mostra a contagem e reconecta ao encerrar @mobile', async ({ page }) => {
    await openSimulator(page, '/')
    const panel = simulator(page)
    const connection = panel.getByTestId('simulator-connection')
    await expect(connection).toContainText('Conectado')

    await panel.getByRole('button', { name: 'Segurar 20 s' }).click()
    await expect(connection).toContainText('Queda simulada')

    await panel.getByRole('button', { name: 'Reconectar agora' }).click()
    await expect(connection).toContainText('Conectado', { timeout: 20_000 })
  })

  test('cenário aplicado pelo painel vale até restaurar os dados @mobile', async ({ page }) => {
    await openSimulator(page, '/')
    const panel = simulator(page)

    await panel.getByLabel('Latência').selectOption('slow')
    await panel.getByRole('button', { name: 'Aplicar cenário' }).click()
    await expect(panel.getByRole('status')).toContainText('Cenário aplicado')
    const scenario = await api<{ latency: string }>(page, '/api/__mock__/scenario')
    expect(scenario.body.latency).toBe('slow')

    await panel.getByRole('button', { name: /Restaurar dados e cenário/ }).click()
    await expect(page).toHaveURL(/localhost:\d+\/$/)
    await expect(page.getByRole('article').first()).toBeVisible({ timeout: 20_000 })
    const restored = await api<{ latency: string }>(page, '/api/__mock__/scenario')
    expect(restored.body.latency).toBe('fast')
  })
})
