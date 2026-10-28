import { expect, test } from '@playwright/test'

import { addToCart, catalogCards, openApp } from './support/app'
import { mock } from './support/mock-api'

test.describe('carregamento, falhas e recuperação', () => {
  test('skeletons aparecem durante o carregamento lento do catálogo @mobile', async ({ page }) => {
    await page.goto('/?latency=slow')
    await expect(page.locator('#catalogo [aria-busy="true"]').first()).toBeVisible()
    await expect(catalogCards(page).first()).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('#catalogo [aria-busy="true"]')).toHaveCount(0)
  })

  test('skeleton do detalhe e do carrinho preservam o carregamento lento @mobile', async ({
    page,
  }) => {
    await openApp(page)
    await addToCart(page, 'emerald-ape-042')

    await page.goto('/nft/emerald-ape-042?latency=slow')
    await expect(page.locator('[aria-busy="true"]').first()).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: 'Emerald Ape #042' })).toBeVisible({
      timeout: 15_000,
    })

    await page.goto('/carrinho?latency=slow')
    await expect(page.locator('[aria-busy="true"]').first()).toBeVisible()
    await expect(page.getByTestId('cart-total')).toBeVisible({ timeout: 15_000 })
  })

  test('falha do catálogo mostra erro e a nova tentativa recupera @mobile', async ({ page }) => {
    await page.goto('/?failure=server-error&failScope=/api/nfts')
    await expect(
      page.getByRole('alert').filter({ hasText: 'Não foi possível carregar o catálogo' }),
    ).toBeVisible({
      timeout: 20_000,
    })

    await mock.scenario(page, { failure: 'none', scope: [] })
    await page.getByRole('button', { name: 'Tentar novamente' }).click()
    await expect(catalogCards(page).first()).toBeVisible()
  })

  test('animação shimmer respeita a preferência por movimento reduzido', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/?latency=slow')
    const skeleton = page.locator('[data-slot="skeleton"]').first()
    await expect(skeleton).toBeVisible()
    const animated = await skeleton.evaluate((el) => getComputedStyle(el, '::before').animationName)
    expect(animated).toContain('shimmer')

    await page.emulateMedia({ reducedMotion: 'reduce' })
    const reduced = await skeleton.evaluate((el) => getComputedStyle(el, '::before').animationName)
    expect(reduced).toBe('none')
  })
})
