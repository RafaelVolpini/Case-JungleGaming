import { expect, test } from '@playwright/test'

import { openApp } from './support/app'
import { mock } from './support/mock-api'

const SLUG = 'emerald-ape-042'

test.describe('detalhe do NFT', () => {
  test('acesso direto exibe o NFT e preserva a URL após refresh @mobile', async ({ page }) => {
    await openApp(page, `/nft/${SLUG}`)
    await expect(page.getByRole('heading', { level: 1, name: 'Emerald Ape #042' })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { level: 1, name: 'Emerald Ape #042' })).toBeVisible()
  })

  test('NFT inexistente mostra estado de não encontrado @mobile', async ({ page }) => {
    await openApp(page, '/nft/nao-existe-999')
    await expect(page.getByText(/não encontrado/i).first()).toBeVisible()
    await expect(
      page.getByRole('link', { name: /explorar|voltar|catálogo/i }).first(),
    ).toBeVisible()
  })

  test('edição esgotada fica indisponível e o limite de quantidade é respeitado @mobile', async ({
    page,
  }) => {
    await openApp(page)
    await mock.changeNft(page, SLUG, { edition: '1/10', available: 0 })
    await mock.changeNft(page, SLUG, { edition: '1/50', available: 3 })
    await openApp(page, `/nft/${SLUG}`)

    await expect(page.getByRole('radio', { name: 'Edição 1/10, esgotada' })).toBeDisabled()
    await page.getByRole('radio', { name: 'Edição 1/50' }).click()

    const increase = page.getByRole('button', { name: 'Aumentar quantidade' })
    const quantity = page.getByRole('group', { name: 'Quantidade' }).locator('output')
    await increase.click()
    await increase.click()
    await expect(quantity).toHaveText('3')
    await increase.click({ force: true })
    await expect(quantity).toHaveText('3')
    await expect(increase).toHaveAttribute('aria-disabled', 'true')
  })
})
