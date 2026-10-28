import { expect, test } from '@playwright/test'

import { catalogCards, catalogSettled, openApp, searchParams } from './support/app'

const firstLine = async (page: import('@playwright/test').Page) =>
  ((await catalogCards(page).first().innerText()).split('\n')[0] ?? '').trim()

test.describe('catálogo', () => {
  test('busca, filtros combinados e ordenação refletidos na URL', async ({ page }) => {
    await openApp(page)
    await expect(catalogCards(page)).toHaveCount(9)

    await page.getByRole('button', { name: 'Buscar NFTs' }).click()
    await page.getByRole('textbox', { name: 'Buscar NFTs' }).fill('Golden')
    await page.keyboard.press('Enter')
    await expect.poll(() => searchParams(page).get('q')).toBe('Golden')
    await catalogSettled(page)
    await expect(catalogCards(page).first()).toContainText('Golden')

    await page.goto('/')
    await page.getByRole('button', { name: /^Ethereum/ }).click()
    await page.getByRole('button', { name: /^Arte digital/ }).click()
    await expect.poll(() => searchParams(page).get('networks')).toBe('ethereum')
    await expect.poll(() => searchParams(page).get('collections')).toBeTruthy()
    await catalogSettled(page)
    const filtered = await catalogCards(page).count()
    expect(filtered).toBeGreaterThan(0)
    expect(filtered).toBeLessThanOrEqual(9)

    await page.getByRole('combobox', { name: /Ordenar por/ }).click()
    await page.getByRole('option', { name: 'Menor preço' }).click()
    await expect.poll(() => searchParams(page).get('sort')).toBe('price-asc')
    await catalogSettled(page)
    await expect
      .poll(async () => {
        const prices = await catalogCards(page).locator('[data-testid="nft-price"]').allInnerTexts()
        const values = prices.map((text) => Number(text.replace(/[^0-9.]/g, '')))
        return values.every((value, index) => index === 0 || value >= (values[index - 1] ?? 0))
      })
      .toBe(true)
  })

  test('paginação reinicia ao mudar filtro e sobrevive ao histórico e ao refresh', async ({
    page,
  }) => {
    await openApp(page)
    const firstOnPageOne = await firstLine(page)

    await page.getByRole('button', { name: 'Página 2' }).click()
    await expect.poll(() => searchParams(page).get('page')).toBe('2')
    await catalogSettled(page)
    await expect(catalogCards(page).first()).not.toContainText(firstOnPageOne)
    const firstOnPageTwo = await firstLine(page)

    await page.getByRole('button', { name: /^Polygon/ }).click()
    await expect.poll(() => searchParams(page).get('page')).toBeNull()
    await expect.poll(() => searchParams(page).get('networks')).toBe('polygon')

    await page.goBack()
    await expect.poll(() => searchParams(page).get('page')).toBe('2')
    await catalogSettled(page)
    await expect(catalogCards(page).first()).toContainText(firstOnPageTwo)

    await page.reload()
    await expect.poll(() => searchParams(page).get('page')).toBe('2')
    await expect(catalogCards(page).first()).toContainText(firstOnPageTwo)
  })
})
