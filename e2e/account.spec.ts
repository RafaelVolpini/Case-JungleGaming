import { expect, test, type Page } from '@playwright/test'

import { loginViaApi, loginViaUi, openApp } from './support/app'
import { api } from './support/mock-api'

const save = (page: Page) => page.getByRole('button', { name: 'Salvar', exact: true }).click()

test.describe('perfil, avatar e senha', () => {
  test('edição de dados e avatar persiste após refresh @mobile', async ({ page }) => {
    await loginViaApi(page, 'ana', '/perfil')
    await page.getByLabel('Nome de exibição').fill('Ana R. Ribeiro')
    await page.getByRole('button', { name: 'Alterar' }).click()
    await page.getByRole('radio', { name: 'Avatar 🚀' }).click()
    await save(page)
    await expect(page.getByText('Perfil atualizado.')).toBeVisible()

    await page.reload()
    await expect(page.getByLabel('Nome de exibição')).toHaveValue('Ana R. Ribeiro')
    await page.getByRole('button', { name: 'Alterar' }).click()
    await expect(page.getByRole('radio', { name: 'Avatar 🚀' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  test('validação do formulário e conflito de e-mail retornado pela API @mobile', async ({
    page,
  }) => {
    await loginViaApi(page, 'ana', '/perfil')
    await page.getByLabel('Nome de usuário').fill('ab')
    await save(page)
    await expect(page.getByText('Mínimo de 3 caracteres')).toBeVisible()

    await page.getByLabel('Nome de usuário').fill('anaribeiro')
    await page.locator('main').getByLabel('E-mail').fill('bruno@kurio.test')
    await save(page)
    await expect(page.getByText('Este e-mail já está em uso.')).toBeVisible()
  })

  test('troca de senha valida a confirmação e a senha atual @mobile', async ({ page }) => {
    await loginViaApi(page, 'ana', '/perfil')
    await page.getByLabel('Senha atual', { exact: true }).fill('senha-errada-1')
    await page.getByLabel('Nova senha', { exact: true }).fill('nova-senha-123')
    await page.getByLabel('Confirmar nova senha', { exact: true }).fill('nova-senha-124')
    await save(page)
    await expect(page.getByText('As senhas não coincidem')).toBeVisible()

    await page.getByLabel('Confirmar nova senha', { exact: true }).fill('nova-senha-123')
    await save(page)
    await expect(page.getByText('Senha atual incorreta.').first()).toBeVisible()

    await page.getByLabel('Senha atual', { exact: true }).fill('kurio-ana-2026')
    await save(page)
    await expect(page.getByText('Perfil atualizado.')).toBeVisible()

    await api(page, '/api/auth/logout', { method: 'POST', auth: true })
    await page.evaluate(() => localStorage.removeItem('kurio:session-token'))
    await openApp(page, '/entrar')
    await page.getByRole('textbox', { name: 'E-mail' }).fill('ana@kurio.test')
    await page.getByLabel('Senha', { exact: true }).fill('kurio-ana-2026')
    await page.getByRole('button', { name: 'Entrar', exact: true }).first().click()
    await expect(
      page.getByRole('alert').filter({ hasText: 'E-mail ou senha inválidos.' }),
    ).toBeVisible()
    await page.getByLabel('Senha', { exact: true }).fill('nova-senha-123')
    await page.getByRole('button', { name: 'Entrar', exact: true }).first().click()
    await expect(page).not.toHaveURL(/\/entrar/)
  })
})

test.describe('carteiras', () => {
  test('erros de validação e conflito de endereço @mobile', async ({ page }) => {
    await loginViaApi(page, 'ana', '/perfil/carteiras')
    const address = page.getByLabel('Endereço da carteira').first()
    await address.fill('0x123')
    await page.getByRole('button', { name: 'Salvar carteira' }).first().click()
    await expect(page.getByText(/Endereço inválido/)).toBeVisible()

    await address.fill('0x3c7e52d81a9f04b6e2d7c381f5a0b94e6d2c8f17')
    await page.getByRole('button', { name: 'Salvar carteira' }).first().click()
    await expect(
      page.getByText('Este endereço já está cadastrado em outra carteira.'),
    ).toBeVisible()
  })

  test('cadastro da carteira principal persiste após refresh @mobile', async ({ page }) => {
    await openApp(page, '/criar-conta?redirect=/perfil/carteiras')
    await page.getByRole('textbox', { name: 'Nome de usuário' }).fill('nova-pessoa')
    await page.getByRole('textbox', { name: 'E-mail' }).fill('nova.pessoa@kurio.test')
    await page.getByLabel('Senha', { exact: true }).fill('senha-segura-1')
    await page.getByLabel('Confirmar senha').fill('senha-segura-1')
    await page.getByRole('button', { name: /Criar (conta|perfil)/ }).click()
    await expect(page).toHaveURL(/\/perfil\/carteiras$/)

    await page.getByLabel('Apelido da carteira').fill('Minha principal')
    await page.getByRole('combobox', { name: 'Rede' }).click()
    await page.getByRole('option', { name: 'Ethereum' }).click()
    await page.getByLabel('Nome do perfil').fill('Nova Pessoa')
    await page.getByLabel('Endereço da carteira').fill('0x1111111111111111111111111111111111111111')
    await page.getByRole('combobox', { name: 'Tipo de carteira' }).click()
    await page.getByRole('option', { name: 'MetaMask' }).click()
    await page.getByLabel('Código de indicação').fill('KURIO-NOVA')
    await page.getByRole('button', { name: 'Salvar carteira' }).first().click()
    await expect(page.getByText('Carteira principal salva.')).toBeVisible()

    await page.reload()
    await expect(page.getByLabel('Apelido da carteira')).toHaveValue('Minha principal')
    await expect(page.getByLabel('Endereço da carteira')).toHaveValue(
      '0x1111111111111111111111111111111111111111',
    )
  })
})
