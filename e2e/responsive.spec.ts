import { expect, test } from '@playwright/test'

import { addToCart, loginViaApi, openApp } from './support/app'
import { horizontalLeaks } from './support/overflow'

const WIDTHS = [320, 390, 768, 1440]

const PUBLIC_ROUTES = ['/', '/nft/emerald-ape-042', '/entrar', '/criar-conta', '/rota-inexistente']
const PRIVATE_ROUTES = ['/carrinho', '/pagamento', '/perfil', '/perfil/carteiras', '/favoritos']

test.describe('responsividade sem overflow horizontal', () => {
  for (const width of WIDTHS) {
    test(`rotas públicas em ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      for (const route of PUBLIC_ROUTES) {
        await openApp(page, route)
        expect(await horizontalLeaks(page), `${route} em ${width}px`).toEqual([])
      }
    })

    test(`rotas privadas em ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await loginViaApi(page, 'ana', '/')
      await addToCart(page, 'emerald-ape-042', { quantity: 2, auth: true })
      for (const route of PRIVATE_ROUTES) {
        await openApp(page, route)
        expect(await horizontalLeaks(page), `${route} em ${width}px`).toEqual([])
      }
    })
  }
})
