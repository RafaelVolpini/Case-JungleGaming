import { expect, test } from '@playwright/test'

import { loginViaApi, openApp } from './support/app'

const TITLES: [string, string | RegExp][] = [
  ['/', 'Kurio · Marketplace de NFTs'],
  ['/nft/emerald-ape-042', 'Emerald Ape #042 · Kurio'],
  ['/carrinho', 'Carrinho · Kurio'],
  ['/entrar', 'Entrar · Kurio'],
  ['/criar-conta', 'Criar conta · Kurio'],
  ['/rota-inexistente', 'Página não encontrada · Kurio'],
]

test.describe('título e anúncio de página', () => {
  test('cada rota pública define um título próprio @mobile', async ({ page }) => {
    for (const [path, title] of TITLES) {
      await openApp(page, path)
      await expect(page).toHaveTitle(title)
    }
  })

  test('rotas privadas e a navegação interna atualizam o título e o anúncio @mobile', async ({
    page,
  }) => {
    await loginViaApi(page, 'ana', '/perfil/carteiras')
    await expect(page).toHaveTitle('Carteiras · Kurio')
    await openApp(page, '/favoritos')
    await expect(page).toHaveTitle('Lista de interesse · Kurio')

    await openApp(page, '/')
    await page
      .getByRole('link', { name: /Emerald Ape #042/ })
      .first()
      .click()
    await expect(page).toHaveTitle('Emerald Ape #042 · Kurio')
    await expect(
      page.getByRole('status').filter({ hasText: 'Emerald Ape #042 · Kurio' }),
    ).toHaveCount(1)
  })
})
