import { expect, test, type Page } from '@playwright/test'

import { openApp } from './support/app'

const ROTATION_WAIT_MS = 9_000

function dots(page: Page) {
  return page.getByRole('group', { name: 'Destaques' }).getByRole('button')
}

function visibleSlide(page: Page) {
  return page.locator('section[aria-labelledby="hero-title"] img[aria-hidden="false"]')
}

async function fill(page: Page, index: number): Promise<string> {
  return dots(page)
    .nth(index)
    .evaluate((element) => getComputedStyle(element).backgroundColor)
}

test.describe('carrossel de destaques', () => {
  test.describe('com animações habilitadas', () => {
    test.use({ reducedMotion: 'no-preference' })

    test('ponto selecionado acompanha a imagem e o carrossel avança sozinho @mobile', async ({
      page,
    }) => {
      await openApp(page)
      await expect(dots(page)).toHaveCount(3)
      await expect(dots(page).nth(0)).toHaveAttribute('aria-current', 'true')
      await expect(visibleSlide(page)).toHaveAttribute('src', /emerald/)

      const selected = await fill(page, 0)
      expect(await fill(page, 1)).not.toBe(selected)
      expect(await fill(page, 2)).not.toBe(selected)

      await dots(page).nth(1).click()
      await expect(dots(page).nth(1)).toHaveAttribute('aria-current', 'true')
      await expect(dots(page).nth(0)).not.toHaveAttribute('aria-current', 'true')
      await expect(visibleSlide(page)).toHaveAttribute('src', /ivory/)

      await expect(dots(page).nth(2)).toHaveAttribute('aria-current', 'true', {
        timeout: ROTATION_WAIT_MS,
      })
      await expect(visibleSlide(page)).toHaveAttribute('src', /golden/)
    })
  })

  test('não avança sozinho quando o usuário prefere menos movimento @mobile', async ({ page }) => {
    await openApp(page)
    await expect(dots(page).nth(0)).toHaveAttribute('aria-current', 'true')
    await page.waitForTimeout(6_500)
    await expect(dots(page).nth(0)).toHaveAttribute('aria-current', 'true')

    await dots(page).nth(2).click()
    await expect(dots(page).nth(2)).toHaveAttribute('aria-current', 'true')
    await expect(visibleSlide(page)).toHaveAttribute('src', /golden/)
  })
})
