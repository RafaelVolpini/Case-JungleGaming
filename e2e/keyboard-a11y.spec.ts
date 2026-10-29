import { expect, test, type Page } from '@playwright/test'

import { openApp } from './support/app'

const focusInside = (page: Page, selector: string) =>
  page.evaluate(
    (target) => document.querySelector(target)?.contains(document.activeElement) ?? false,
    selector,
  )

test.describe('teclado, foco e formulários', () => {
  test('link de pular conteúdo e foco visível nos controles', async ({ page, isMobile }) => {
    test.skip(isMobile, 'cabeçalho é exclusivo do desktop')
    await openApp(page)
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Pular para o conteúdo' })
    await expect(skip).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('#conteudo')).toBeFocused()

    for (let step = 0; step < 6; step += 1) {
      await page.keyboard.press('Tab')
      const visible = await page.evaluate(() => {
        const element = document.activeElement
        if (!element || element === document.body) return false
        const style = getComputedStyle(element)
        return (
          (style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) > 0) ||
          style.boxShadow !== 'none'
        )
      })
      expect(visible).toBe(true)
    }
  })

  test('diálogo de busca prende o foco e devolve ao fechar', async ({ page, isMobile }) => {
    test.skip(isMobile, 'a busca em diálogo é exclusiva do desktop')
    await openApp(page)
    const trigger = page.getByRole('button', { name: 'Buscar NFTs' })
    await trigger.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Buscar NFTs' })).toBeFocused()

    for (let step = 0; step < 6; step += 1) {
      await page.keyboard.press('Tab')
      expect(await focusInside(page, '[role="dialog"]')).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('modal de login foca o primeiro campo, prende o foco e fecha com Esc', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'no mobile o login é uma tela cheia')
    await openApp(page, '/entrar')
    await expect(page.getByRole('textbox', { name: 'E-mail' })).toBeFocused()
    for (let step = 0; step < 12; step += 1) {
      await page.keyboard.press('Tab')
      expect(await focusInside(page, '[role="dialog"]')).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(page).toHaveURL(/localhost:\d+\/$/)
  })

  test('erros de validação ficam associados aos campos @mobile', async ({ page }) => {
    await openApp(page, '/criar-conta')
    await page.getByRole('button', { name: /Criar (conta|perfil)/ }).click()

    const username = page.getByRole('textbox', { name: 'Nome de usuário' })
    await expect(username).toHaveAttribute('aria-invalid', 'true')
    const describedBy = await username.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    await expect(page.locator(`[id="${describedBy}"]`)).toContainText('Mínimo de 3 caracteres')
  })

  test('selects obrigatórios expõem obrigatoriedade e o erro associado @mobile', async ({
    page,
  }) => {
    await openApp(page, '/criar-conta?redirect=/perfil/carteiras')
    await page.getByRole('textbox', { name: 'Nome de usuário' }).fill('nova-pessoa')
    await page.getByRole('textbox', { name: 'E-mail' }).fill('nova.pessoa@kurio.test')
    await page.getByLabel('Senha', { exact: true }).fill('senha-segura-1')
    await page.getByLabel('Confirmar senha').fill('senha-segura-1')
    await page.getByRole('button', { name: /Criar (conta|perfil)/ }).click()
    await expect(page).toHaveURL(/\/perfil\/carteiras$/)
    await page.getByRole('button', { name: 'Salvar carteira' }).first().click()

    const network = page.getByRole('combobox', { name: 'Rede' })
    await expect(network).toHaveAttribute('aria-required', 'true')
    await expect(network).toHaveAttribute('aria-invalid', 'true')
    const describedBy = await network.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    await expect(page.locator(`[id="${describedBy}"]`)).toBeVisible()
  })

  test('painel de filtros do mobile prende o foco e fecha com Esc @mobile', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'drawer de filtros é exclusivo do mobile')
    await openApp(page)
    await page.getByRole('button', { name: 'Abrir filtros' }).click()
    const sheet = page.getByRole('dialog', { name: 'Filtros' })
    await expect(sheet).toBeVisible()
    for (let step = 0; step < 8; step += 1) {
      await page.keyboard.press('Tab')
      expect(await focusInside(page, '[role="dialog"]')).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
  })
})
