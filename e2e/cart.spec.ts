import { expect, test, type Page } from '@playwright/test'

import { addToCart, loginViaUi, openApp } from './support/app'
import { expectMinimumBlocked } from './support/stepper'

const amount = async (page: Page) => {
  const text = await page.getByTestId('cart-total').innerText()
  return Number(text.replace(/[^0-9.]/g, ''))
}

test.describe('carrinho', () => {
  test('quantidades, remoção e estado vazio @mobile', async ({ page }) => {
    await openApp(page)
    await addToCart(page, 'emerald-ape-042')
    await addToCart(page, 'golden-beat-207')
    await openApp(page, '/carrinho')

    const before = await amount(page)
    const group = page.getByRole('group', { name: 'Quantidade de Emerald Ape #042' })
    await expectMinimumBlocked(group, '1')
    await group.getByRole('button', { name: 'Aumentar quantidade' }).click()
    await expect.poll(() => amount(page)).toBeGreaterThan(before)

    await page.getByRole('button', { name: 'Remover Emerald Ape #042 do carrinho' }).click()
    await expect(
      page.getByRole('list', { name: 'Itens do carrinho' }).getByText('Emerald Ape #042'),
    ).toHaveCount(0)
    await page.getByRole('button', { name: 'Remover Golden Beat #207 do carrinho' }).click()
    await expect(page.getByText('Seu carrinho está vazio')).toBeVisible()
  })

  test('cupom válido aplica desconto e pode ser removido @mobile', async ({ page }) => {
    await openApp(page)
    await addToCart(page, 'emerald-ape-042', { quantity: 2 })
    await openApp(page, '/carrinho')
    const before = await amount(page)

    await page.getByLabel('Código promocional').fill('KURIO10')
    await page.getByRole('button', { name: 'Aplicar' }).click()
    await expect(page.getByText(/Cupom KURIO10/).first()).toBeVisible()
    await expect.poll(() => amount(page)).toBeLessThan(before)

    await page.getByRole('button', { name: 'Remover cupom KURIO10' }).click()
    await expect.poll(() => amount(page)).toBe(before)
  })

  test('cupom inválido ou expirado exibe o erro retornado pela API @mobile', async ({ page }) => {
    await openApp(page)
    await addToCart(page, 'emerald-ape-042')
    await openApp(page, '/carrinho')

    await page.getByLabel('Código promocional').fill('NAOEXISTE')
    await page.getByRole('button', { name: 'Aplicar' }).click()
    await expect(
      page.getByRole('alert').filter({ hasText: /inválido|não existe|encontrado/i }),
    ).toBeVisible()

    await page.getByLabel('Código promocional').fill('EXPIRADO')
    await page.getByRole('button', { name: 'Aplicar' }).click()
    await expect(page.getByRole('alert').filter({ hasText: /expirou|expirado/i })).toBeVisible()
  })

  test('carrinho do visitante persiste após refresh e é preservado no login @mobile', async ({
    page,
  }) => {
    await openApp(page)
    await addToCart(page, 'violet-nomad-314', { quantity: 2 })
    await openApp(page, '/carrinho')
    await expect(page.getByText('Violet Nomad #314').first()).toBeVisible()

    await page.reload()
    await expect(page.getByText('Violet Nomad #314').first()).toBeVisible()

    await loginViaUi(page, 'ana', '/carrinho')
    await expect(page.getByText('Violet Nomad #314').first()).toBeVisible()
    await expect(
      page.getByRole('group', { name: 'Quantidade de Violet Nomad #314' }).locator('output'),
    ).toHaveText('2')
  })
})
