import { expect, test, type Page } from '@playwright/test'

import { addToCart, loginViaApi, openApp } from './support/app'

const inside = (page: Page, selector: string) =>
  page.evaluate(
    (target) => document.querySelector(target)?.contains(document.activeElement) ?? false,
    selector,
  )

async function readyToConfirm(page: Page) {
  await loginViaApi(page, 'ana', '/')
  await addToCart(page, 'golden-beat-207', { auth: true })
  await openApp(page, '/pagamento')
}

test.describe('checkout: validação e foco', () => {
  test('campos obrigatórios do formulário são validados e associados ao erro', async ({ page }) => {
    await readyToConfirm(page)
    const profileName = page.getByLabel('Nome do perfil')
    const referral = page.getByLabel('Código de indicação')
    await profileName.fill('')
    await referral.fill('')

    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    for (const [field, message] of [
      [profileName, 'Informe o nome do perfil'],
      [referral, 'Informe o código de indicação'],
    ] as const) {
      await expect(field).toHaveAttribute('aria-invalid', 'true')
      const describedBy = await field.getAttribute('aria-describedby')
      await expect(page.locator(`[id="${describedBy}"]`)).toContainText(message)
    }

    await profileName.fill('Ana Ribeiro')
    await referral.fill('KURIO-ANA')
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('diálogo de confirmação prende o foco, respeita Shift+Tab e devolve o foco @mobile', async ({
    page,
  }) => {
    await readyToConfirm(page)
    const open = page.getByRole('button', { name: 'Confirmar compra' })
    await open.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(page.getByRole('button', { name: 'Confirmar e enviar' })).toBeEnabled()

    for (let step = 0; step < 8; step += 1) {
      await page.keyboard.press('Tab')
      expect(await inside(page, '[role="dialog"]')).toBe(true)
    }
    for (let step = 0; step < 8; step += 1) {
      await page.keyboard.press('Shift+Tab')
      expect(await inside(page, '[role="dialog"]')).toBe(true)
    }

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(open).toBeFocused()
  })

  test('recibo do pedido é um diálogo com foco preso e fecha com Esc @mobile', async ({ page }) => {
    test.setTimeout(60_000)
    await readyToConfirm(page)
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await page.getByRole('button', { name: 'Confirmar e enviar' }).click()
    await expect(page).toHaveURL(/\/pedido\//)
    await expect(page.getByText('Seus NFTs agora estão na sua carteira')).toBeVisible({
      timeout: 25_000,
    })

    for (let step = 0; step < 6; step += 1) {
      await page.keyboard.press('Tab')
      expect(await inside(page, '[role="dialog"]')).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(page).toHaveURL(/localhost:\d+\/$/)
  })
})
