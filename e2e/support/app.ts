import { expect, type Page } from '@playwright/test'

import { api, USERS } from './mock-api'

export type UserKey = keyof typeof USERS

export async function openApp(page: Page, path = '/'): Promise<void> {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
  await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller))
}

export async function loginViaUi(page: Page, who: UserKey, redirect?: string): Promise<void> {
  const search = redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''
  await openApp(page, `/entrar${search}`)
  await page.getByRole('textbox', { name: 'E-mail' }).fill(USERS[who].email)
  await page.getByLabel('Senha', { exact: true }).fill(USERS[who].password)
  await page.getByRole('button', { name: 'Entrar', exact: true }).first().click()
  await expect(page).not.toHaveURL(/\/entrar/)
}

export async function loginViaApi(page: Page, who: UserKey, path = '/'): Promise<void> {
  await openApp(page, '/')
  const { body } = await api<{ token: string }>(page, '/api/auth/login', {
    method: 'POST',
    body: { email: USERS[who].email, password: USERS[who].password },
  })
  await page.evaluate((token) => localStorage.setItem('kurio:session-token', token), body.token)
  await openApp(page, path)
}

type NftLookup = { id: string; editions: { id: string; label: string }[] }

export async function addToCart(
  page: Page,
  slug: string,
  { edition = '1/50', quantity = 1, auth = false } = {},
): Promise<void> {
  const { body: nft } = await api<NftLookup>(page, `/api/nfts/${slug}`, { auth })
  const target = nft.editions.find((candidate) => candidate.label === edition)
  if (!target) throw new Error(`Edição ${edition} não encontrada em ${slug}`)
  const { status } = await api(page, '/api/cart/items', {
    method: 'POST',
    auth,
    body: { nftId: nft.id, editionId: target.id, quantity },
  })
  expect(status).toBeLessThan(300)
}

export function catalogCards(page: Page) {
  return page.locator('#catalogo').getByRole('article')
}

export async function catalogSettled(page: Page): Promise<void> {
  await expect(page.locator('#catalogo ul[aria-busy="true"]')).toHaveCount(0)
}

export async function waitForImages(page: Page): Promise<void> {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 60))
    }
    window.scrollTo(0, 0)
    await Promise.all(
      [...document.images]
        .filter((image) => !image.complete)
        .map((image) => new Promise((resolve) => (image.onload = image.onerror = resolve))),
    )
  })
}

export function searchParams(page: Page): URLSearchParams {
  return new URL(page.url()).searchParams
}

export async function logoutViaUi(page: Page, isMobile: boolean): Promise<void> {
  if (isMobile) {
    await openApp(page, '/perfil')
    await page.getByRole('button', { name: 'Sair' }).click()
  } else {
    await page
      .getByRole('button', { name: /Ana|Bruno|Novo/ })
      .first()
      .click()
    await page.getByRole('menuitem', { name: 'Sair' }).click()
  }
  await expect(page).toHaveURL(/\/$/)
}
