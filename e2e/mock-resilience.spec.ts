import { expect, test, type Page } from '@playwright/test'

import { catalogCards, catalogSettled, openApp, searchParams } from './support/app'
import { api } from './support/mock-api'

async function namesFromApi(page: Page, network: string): Promise<string[]> {
  const { body } = await api<{ items: { name: string }[] }>(page, `/api/nfts?networks=${network}`)
  return body.items.map((item) => item.name)
}

async function namesOnScreen(page: Page): Promise<string[]> {
  const names = await catalogCards(page).locator('h3').allInnerTexts()
  return names.map((name) => name.trim())
}

test.describe('camada de mocks', () => {
  test('filtro por rede troca a lista pelos NFTs da rede escolhida', async ({ page }) => {
    await openApp(page)
    await expect(catalogCards(page)).toHaveCount(9)
    const everything = await namesOnScreen(page)

    await page.getByRole('button', { name: /^Polygon/ }).click()
    await expect.poll(() => searchParams(page).get('networks')).toBe('polygon')
    await catalogSettled(page)

    const expected = await namesFromApi(page, 'polygon')
    await expect.poll(() => namesOnScreen(page)).toEqual(expected)
    expect(expected).not.toEqual(everything)
  })

  test('catálogo se recupera quando o service worker do MSW é encerrado', async ({
    page,
    context,
  }) => {
    await openApp(page)
    await expect(catalogCards(page)).toHaveCount(9)
    const expected = await namesFromApi(page, 'solana')

    const session = await context.newCDPSession(page)
    await session.send('ServiceWorker.enable')
    await session.send('ServiceWorker.stopAllWorkers')

    await page.getByRole('button', { name: /^Solana/ }).click()
    await expect.poll(() => searchParams(page).get('networks')).toBe('solana')
    await catalogSettled(page)

    await expect(page.getByText('Não foi possível carregar o catálogo')).toHaveCount(0)
    await expect.poll(() => namesOnScreen(page)).toEqual(expected)
  })
})
