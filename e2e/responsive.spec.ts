import { expect, test, type Page } from '@playwright/test'

import { addToCart, loginViaApi, openApp, waitForImages } from './support/app'

const WIDTHS = [390, 768, 1440]

const PUBLIC_ROUTES = ['/', '/nft/emerald-ape-042', '/entrar', '/criar-conta', '/rota-inexistente']
const PRIVATE_ROUTES = ['/carrinho', '/pagamento', '/perfil', '/perfil/carteiras', '/favoritos']

async function overflow(page: Page) {
  await waitForImages(page)
  return page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }))
}

test.describe('responsividade sem overflow horizontal', () => {
  for (const width of WIDTHS) {
    test(`rotas públicas em ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      for (const route of PUBLIC_ROUTES) {
        await openApp(page, route)
        const { scroll, client } = await overflow(page)
        expect(scroll, `${route} em ${width}px`).toBeLessThanOrEqual(client)
      }
    })

    test(`rotas privadas em ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await loginViaApi(page, 'ana', '/')
      await addToCart(page, 'emerald-ape-042', { quantity: 2, auth: true })
      for (const route of PRIVATE_ROUTES) {
        await openApp(page, route)
        const { scroll, client } = await overflow(page)
        expect(scroll, `${route} em ${width}px`).toBeLessThanOrEqual(client)
      }
    })
  }
})
