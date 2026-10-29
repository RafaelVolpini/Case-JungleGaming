import { expect, type Page } from '@playwright/test'

import { catalogSettled, searchParams } from './app'

export async function searchFor(page: Page, term: string, isMobile: boolean) {
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

export async function pickFeed(page: Page, name: string) {
  await page.getByRole('tablist', { name: 'Tipo de listagem' }).getByRole('tab', { name }).click()
}
