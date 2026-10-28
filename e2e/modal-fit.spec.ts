import { expect, test, type Page } from '@playwright/test'

import { loginViaApi, openApp } from './support/app'
import { api } from './support/mock-api'

const SHORT = { width: 1280, height: 600 }
const TALL = { width: 1440, height: 1000 }
const MARGIN = 24

async function dialogBox(page: Page) {
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  const box = await dialog.boundingBox()
  if (!box) throw new Error('modal sem caixa de layout')
  return box
}

async function scrollOverlay(page: Page) {
  await page.mouse.move(SHORT.width / 2, SHORT.height / 2)
  await page.mouse.wheel(0, 1000)
}

async function placeSampleOrder(page: Page) {
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
  return page.url()
}

test.describe('modais em telas baixas', () => {
  test.use({ viewport: SHORT })

  test('login e cadastro mantêm o tamanho do Figma e rolam até o fim', async ({ page }) => {
    await openApp(page, '/entrar')
    const login = await dialogBox(page)
    expect(Math.round(login.width)).toBe(500)
    expect(Math.round(login.height)).toBe(600)
    expect(login.y).toBeGreaterThanOrEqual(0)

    await scrollOverlay(page)
    await expect(page.getByRole('link', { name: 'Crie uma conta' })).toBeInViewport()
    const scrolled = await dialogBox(page)
    expect(scrolled.y + scrolled.height).toBeLessThanOrEqual(SHORT.height - MARGIN + 1)

    await page.getByRole('link', { name: 'Crie uma conta' }).click()
    await expect(page).toHaveURL(/\/criar-conta/)
    await expect(page.getByRole('textbox', { name: 'Nome de usuário' })).toBeVisible()
    const register = await dialogBox(page)
    expect(Math.round(register.width)).toBe(500)
    expect(Math.round(register.height)).toBe(656)
    expect(register.y).toBeGreaterThanOrEqual(0)

    await scrollOverlay(page)
    await page.getByRole('link', { name: 'Entre', exact: true }).click()
    await expect(page).toHaveURL(/\/entrar/)
  })

  test('recibo mantém 578 px de largura e rola até o botão do Etherscan', async ({ page }) => {
    await placeSampleOrder(page)
    const box = await dialogBox(page)
    expect(Math.round(box.width)).toBe(578)
    expect(box.height).toBeGreaterThan(SHORT.height)
    expect(box.y).toBeGreaterThanOrEqual(0)

    await scrollOverlay(page)
    await expect(page.getByRole('link', { name: /Ver no Etherscan/ })).toBeInViewport()
    const scrolled = await dialogBox(page)
    expect(scrolled.y + scrolled.height).toBeLessThanOrEqual(SHORT.height - MARGIN + 1)
  })

  test('recibo fica centralizado e sem rolagem quando a janela comporta', async ({ page }) => {
    await placeSampleOrder(page)
    await page.setViewportSize(TALL)
    await expect
      .poll(async () => {
        const box = await dialogBox(page)
        const centered = Math.abs(box.y - (TALL.height - box.height) / 2) <= 2
        return centered && box.y + box.height <= TALL.height
      })
      .toBe(true)
  })

  test('clicar fora ou Esc fecham o recibo', async ({ page }) => {
    const orderUrl = await placeSampleOrder(page)
    await page.mouse.click(20, SHORT.height / 2)
    await expect(page).toHaveURL(/localhost:\d+\/$/)

    await page.goto(orderUrl)
    await expect(page.getByText('Seus NFTs agora estão na sua carteira')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page).toHaveURL(/localhost:\d+\/$/)
  })
})
