import { expect, test, type Page } from '@playwright/test'

import { catalogCards, catalogSettled, openApp, searchParams } from './support/app'

async function searchFor(page: Page, term: string, isMobile: boolean) {
  if (isMobile) {
    await page.getByRole('searchbox', { name: 'Buscar NFTs' }).fill(term)
  } else {
    await page.getByRole('button', { name: 'Buscar NFTs' }).click()
    await page.getByRole('textbox', { name: 'Buscar NFTs' }).fill(term)
  }
  await page.keyboard.press('Enter')
  await expect.poll(() => searchParams(page).get('q')).toBe(term)
  await catalogSettled(page)
}

test.describe('filtros ativos do catálogo', () => {
  test('a busca vira um filtro removível e a caixa acompanha a URL @mobile', async ({
    page,
    isMobile,
  }) => {
    await openApp(page)
    await searchFor(page, 'Golden', isMobile)

    const chip = page.getByRole('button', { name: 'Remover filtro Busca: Golden' })
    await expect(page.getByRole('list', { name: 'Filtros ativos' })).toBeVisible()
    await expect(chip).toBeVisible()

    await chip.click()
    await expect.poll(() => searchParams(page).get('q')).toBeNull()
    await expect(chip).toHaveCount(0)
    await catalogSettled(page)
    await expect(catalogCards(page)).toHaveCount(9)
  })

  test('voltar no histórico limpa a caixa de busca e o filtro @mobile', async ({
    page,
    isMobile,
  }) => {
    await openApp(page)
    await searchFor(page, 'Golden', isMobile)
    await page.goBack()
    await expect.poll(() => searchParams(page).get('q')).toBeNull()
    await expect(page.getByRole('button', { name: /Remover filtro Busca/ })).toHaveCount(0)

    if (isMobile) {
      await expect(page.getByRole('searchbox', { name: 'Buscar NFTs' })).toHaveValue('')
    } else {
      await page.goForward()
      await page.getByRole('button', { name: 'Buscar NFTs' }).click()
      await expect(page.getByRole('textbox', { name: 'Buscar NFTs' })).toHaveValue('Golden')
    }
  })

  test('limpar filtros remove busca e rede de uma vez e mantém a aba @mobile', async ({ page }) => {
    await openApp(page, '/?feed=trending&networks=ethereum&q=ape')
    await expect(page.getByRole('button', { name: 'Remover filtro Rede: Ethereum' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Remover filtro Busca: ape' })).toBeVisible()

    await page.getByRole('button', { name: 'Limpar filtros' }).first().click()
    await expect.poll(() => searchParams(page).get('q')).toBeNull()
    await expect.poll(() => searchParams(page).get('networks')).toBeNull()
    expect(searchParams(page).get('feed')).toBe('trending')
    await expect(page.getByRole('list', { name: 'Filtros ativos' })).toHaveCount(0)
  })
})
