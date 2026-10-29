import { expect, test, type Page } from '@playwright/test'

import { addToCart, catalogCards, openApp, waitForImages } from './support/app'

type ShiftWindow = Window & { __layoutShift?: number }

async function trackLayoutShift(page: Page) {
  await page.addInitScript(() => {
    const target = window as ShiftWindow
    target.__layoutShift = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceEntry[]) {
        const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean }
        if (!shift.hadRecentInput) target.__layoutShift = (target.__layoutShift ?? 0) + shift.value
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })
}

const layoutShift = (page: Page) => page.evaluate(() => (window as ShiftWindow).__layoutShift ?? 0)

const MAX_SHIFT = 0.02

test.describe('skeletons preservam o layout', () => {
  test('catálogo sem deslocamento ao trocar o skeleton pelo conteúdo @mobile', async ({ page }) => {
    await trackLayoutShift(page)
    await page.goto('/?latency=slow')
    await expect(page.locator('#catalogo [aria-busy="true"]').first()).toBeVisible()
    await expect(catalogCards(page).first()).toBeVisible({ timeout: 15_000 })
    await waitForImages(page)
    expect(await layoutShift(page)).toBeLessThan(MAX_SHIFT)
  })

  test('detalhe sem deslocamento ao trocar o skeleton pelo conteúdo @mobile', async ({ page }) => {
    await trackLayoutShift(page)
    await page.goto('/nft/emerald-ape-042?latency=slow')
    await expect(page.locator('[aria-busy="true"]').first()).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: 'Emerald Ape #042' })).toBeVisible({
      timeout: 15_000,
    })
    await waitForImages(page)
    expect(await layoutShift(page)).toBeLessThan(MAX_SHIFT)
  })

  test('carrinho sem deslocamento ao trocar o skeleton pelo resumo @mobile', async ({ page }) => {
    await openApp(page)
    await addToCart(page, 'emerald-ape-042', { quantity: 2 })
    await trackLayoutShift(page)
    await page.goto('/carrinho?latency=slow')
    await expect(page.locator('[aria-busy="true"]').first()).toBeVisible()
    await expect(page.getByTestId('cart-total')).toBeVisible({ timeout: 15_000 })
    await waitForImages(page)
    expect(await layoutShift(page)).toBeLessThan(MAX_SHIFT)
  })
})
