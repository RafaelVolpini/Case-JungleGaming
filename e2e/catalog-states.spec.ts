import { expect, test } from '@playwright/test'

import { catalogCards, catalogSettled, openApp, searchParams } from './support/app'
import { pickFeed, searchFor } from './support/catalog'
import { api } from './support/mock-api'

type Listing = { items: { name: string }[] }

test.describe('catálogo: estados e histórico', () => {
  test('resultado vazio mostra orientação e limpar filtros restaura a lista @mobile', async ({
    page,
    isMobile,
  }) => {
    await openApp(page)
    await searchFor(page, 'zzz-inexistente', isMobile)

    await expect(page.getByText('Nenhum NFT encontrado')).toBeVisible()
    await expect(catalogCards(page)).toHaveCount(0)

    await page.getByRole('button', { name: 'Limpar filtros' }).first().click()
    await expect.poll(() => searchParams(page).get('q')).toBeNull()
    await catalogSettled(page)
    await expect(catalogCards(page)).toHaveCount(9)
  })

  test('busca, aba e filtros sobrevivem ao refresh e ao histórico @mobile', async ({
    page,
    isMobile,
  }) => {
    await openApp(page)
    await searchFor(page, 'Golden', isMobile)
    await pickFeed(page, 'Em alta')
    await expect.poll(() => searchParams(page).get('feed')).toBe('trending')
    await catalogSettled(page)

    await page.reload()
    await expect(page.getByRole('button', { name: 'Remover filtro Busca: Golden' })).toBeVisible()
    await expect(
      page.getByRole('tablist', { name: 'Tipo de listagem' }).getByRole('tab', { name: 'Em alta' }),
    ).toHaveAttribute('aria-selected', 'true')
    expect(searchParams(page).get('q')).toBe('Golden')

    await page.goBack()
    await expect.poll(() => searchParams(page).get('feed')).toBeNull()
    expect(searchParams(page).get('q')).toBe('Golden')
    await page.goForward()
    await expect.poll(() => searchParams(page).get('feed')).toBe('trending')
  })

  test('respostas fora de ordem não sobrescrevem a última escolha @mobile', async ({ page }) => {
    await page.goto('/?latency=out-of-order')
    await page.waitForLoadState('networkidle')
    const expected = await api<Listing>(page, '/api/nfts?feed=all&page=1')
    const firstName = expected.body.items[0]?.name ?? ''
    expect(firstName).not.toBe('')

    await pickFeed(page, 'Em alta')
    await pickFeed(page, 'Novos lançamentos')
    await pickFeed(page, 'Todos os NFTs')

    await expect.poll(() => searchParams(page).get('feed')).toBeNull()
    await catalogSettled(page)
    await expect(catalogCards(page).first()).toContainText(firstName)
  })
})
