import { expect, test, type Page } from '@playwright/test'

import { openApp } from './support/app'
import { mock } from './support/mock-api'

const SLUG = 'emerald-ape-042'

async function connectedDetail(page: Page) {
  await openApp(page, `/nft/${SLUG}`)
  await expect(page.getByText('1.19 ETH').first()).toBeVisible()
  await expect.poll(() => mock.socketClients(page)).toBeGreaterThan(0)
}

const settleFrames = (page: Page) =>
  page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  )

test.describe('tempo real: controles do simulador de rede', () => {
  test('evento duplicado reenviado pelo servidor não altera o estado @mobile', async ({ page }) => {
    await connectedDetail(page)
    await mock.changeNft(page, SLUG, { priceEth: '2.00' })
    await expect(page.getByText('2.00 ETH').first()).toBeVisible()

    const { body } = await mock.replay(page, SLUG, 'duplicate')
    expect(body.delivered).toBeGreaterThan(0)
    await settleFrames(page)
    await expect(page.getByText('2.00 ETH').first()).toBeVisible()
  })

  test('evento antigo reenviado depois de uma mudança mais nova é descartado @mobile', async ({
    page,
  }) => {
    await connectedDetail(page)
    await mock.changeNft(page, SLUG, { priceEth: '2.00' })
    await expect(page.getByText('2.00 ETH').first()).toBeVisible()
    await mock.changeNft(page, SLUG, { priceEth: '3.00' })
    await expect(page.getByText('3.00 ETH').first()).toBeVisible()

    const { body } = await mock.replay(page, SLUG, 'stale')
    expect(body.delivered).toBeGreaterThan(0)
    await settleFrames(page)
    await expect(page.getByText('3.00 ETH').first()).toBeVisible()
    await expect(page.getByText('2.00 ETH')).toHaveCount(0)
  })

  test('queda com retenção: o preço muda offline e a reconexão reconcilia pela API @mobile', async ({
    page,
  }) => {
    test.setTimeout(60_000)
    await connectedDetail(page)
    await mock.dropSocket(page, 30_000)
    await expect.poll(() => mock.socketClients(page)).toBe(0)

    await mock.changeNft(page, SLUG, { priceEth: '5.55' })
    await settleFrames(page)
    await expect(page.getByText('5.55 ETH')).toHaveCount(0)

    await mock.reconnectSocket(page)
    await expect(page.getByText('5.55 ETH').first()).toBeVisible({ timeout: 25_000 })
    await expect.poll(() => mock.socketClients(page)).toBeGreaterThan(0)
  })
})
