import { expect, test } from '@playwright/test'

import { openApp } from './support/app'
import { mock } from './support/mock-api'
import { expectMinimumBlocked } from './support/stepper'

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
    await expect(page.getByText('Só restam 3 desta edição.')).toBeVisible()
    await expect(increase).toHaveAttribute('aria-disabled', 'true')
  })

  test('o botão de diminuir fica bloqueado com uma unidade @mobile', async ({ page }) => {
    await openApp(page, `/nft/${SLUG}`)
    const group = page.getByRole('group', { name: 'Quantidade' })
    await expectMinimumBlocked(page, group, '1')

    await group.getByRole('button', { name: 'Aumentar quantidade' }).click()
    await expect(group.locator('output')).toHaveText('2')
    await expect(group.getByRole('button', { name: 'Diminuir quantidade' })).not.toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })

  test('ampliar a imagem abre o diálogo e devolve o foco ao fechar', async ({ page }) => {
    await openApp(page, `/nft/${SLUG}`)
    const zoom = page.getByRole('button', { name: 'Ampliar imagem' })
    await zoom.click()
    const dialog = page.getByRole('dialog', { name: 'Emerald Ape #042' })
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(zoom).toBeFocused()
  })
})
