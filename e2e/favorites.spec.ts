import { expect, test } from '@playwright/test'

import { loginViaApi } from './support/app'
import { mock } from './support/mock-api'

const SLUG = 'golden-signal-160'

test.describe('favoritos', () => {
  test('atualização otimista, falha com rollback e recuperação @mobile', async ({ page }) => {
    await loginViaApi(page, 'ana', `/nft/${SLUG}`)
    const heart = page
      .getByRole('button', { name: /Favoritar|aos favoritos|dos favoritos/ })
      .first()
    await expect(heart).toHaveAttribute('aria-pressed', 'false')

    await mock.scenario(page, { failure: 'server-error', scope: ['/api/favorites'] })
    await heart.click()
    await expect(page.getByText(/Não foi possível atualizar seus favoritos/)).toBeVisible()
    await expect(heart).toHaveAttribute('aria-pressed', 'false')

    await mock.scenario(page, { failure: 'none', scope: [] })
    await heart.click()
    await expect(heart).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByText(/adicionado aos favoritos/)).toBeVisible()

    await page.reload()
    await expect(
      page.getByRole('button', { name: /Favoritar|aos favoritos|dos favoritos/ }).first(),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  test('favoritos exigem autenticação e levam ao login com retorno', async ({ page }) => {
    await page.goto(`/nft/${SLUG}`)
    await page
      .getByRole('button', { name: /Favoritar|aos favoritos/ })
      .first()
      .click()
    await expect(page).toHaveURL(/\/entrar/)
    expect(decodeURIComponent(new URL(page.url()).search)).toContain(`/nft/${SLUG}`)
  })

  test('lista de interesse mostra os favoritos persistidos do usuário @mobile', async ({
    page,
  }) => {
    await loginViaApi(page, 'ana', '/favoritos')
    await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Golden Beat #207' })).toBeVisible()
  })

  test('o coração muda na hora, antes da resposta lenta, e volta se a API falhar @mobile', async ({
    page,
  }) => {
    await loginViaApi(page, 'ana', `/nft/${SLUG}`)
    const heart = page
      .getByRole('button', { name: /Favoritar|aos favoritos|dos favoritos/ })
      .first()
    await expect(heart).toHaveAttribute('aria-pressed', 'false')

    await mock.scenario(page, {
      latency: 'slow',
      failure: 'server-error',
      scope: ['/api/favorites'],
    })
    await heart.click()
    await expect(heart).toHaveAttribute('aria-pressed', 'true', { timeout: 1_000 })
    await expect(page.getByText(/Não foi possível atualizar seus favoritos/)).toBeVisible({
      timeout: 10_000,
    })
    await expect(heart).toHaveAttribute('aria-pressed', 'false')
  })

  test('falha ao desfavoritar mantém o item favorito e permite tentar de novo @mobile', async ({
    page,
  }) => {
    await loginViaApi(page, 'ana', '/nft/emerald-ape-042')
    const heart = page
      .getByRole('button', { name: /Favoritar|aos favoritos|dos favoritos/ })
      .first()
    await expect(heart).toHaveAttribute('aria-pressed', 'true')

    await mock.scenario(page, { failure: 'server-error', scope: ['/api/favorites'] })
    await heart.click()
    await expect(page.getByText(/Não foi possível atualizar seus favoritos/)).toBeVisible()
    await expect(heart).toHaveAttribute('aria-pressed', 'true')

    await mock.scenario(page, { failure: 'none', scope: [] })
    await heart.click()
    await expect(heart).toHaveAttribute('aria-pressed', 'false')
  })
})
