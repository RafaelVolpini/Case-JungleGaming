import { expect, test } from '@playwright/test'

import { openApp } from './support/app'

test.describe('barra de abas mobile', () => {
  test('botão de escanear responde em toda a sua área @mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'A barra de abas só existe no mobile')
    await openApp(page)
    const scan = page.getByRole('button', { name: 'Escanear QR code' })

    await scan.click({ position: { x: 32, y: 58 } })
    await expect(
      page.getByText('O leitor de QR code não está disponível nesta versão.'),
    ).toBeVisible()
  })
})
