import { expect, test } from '@playwright/test'

import { loginViaApi, loginViaUi, logoutViaUi, openApp } from './support/app'
import { mock } from './support/mock-api'

test.describe('conta e sessão', () => {
  test('cadastro cria a sessão e leva ao destino @mobile', async ({ page }) => {
    await openApp(page, '/criar-conta?redirect=/favoritos')
    await page.getByRole('textbox', { name: 'Nome de usuário' }).fill('colecionador-novo')
    await page.getByRole('textbox', { name: 'E-mail' }).fill('novo@kurio.test')
    await page.getByLabel('Senha', { exact: true }).fill('senha-segura-1')
    await page.getByLabel('Confirmar senha').fill('senha-segura-1')
    await page.getByRole('button', { name: /Criar (conta|perfil)/ }).click()
    await expect(page).toHaveURL(/\/favoritos$/)
    await expect(page.getByText('Você ainda não favoritou nenhum NFT')).toBeVisible()
  })

  test('cadastro valida campos e mostra conflitos da API @mobile', async ({ page }) => {
    await openApp(page, '/criar-conta')
    await page.getByRole('textbox', { name: 'Nome de usuário' }).fill('ab')
    await page.getByRole('textbox', { name: 'E-mail' }).fill('invalido')
    await page.getByLabel('Senha', { exact: true }).fill('123')
    await page.getByLabel('Confirmar senha').fill('456')
    await page.getByRole('button', { name: /Criar (conta|perfil)/ }).click()
    await expect(page.getByText('Mínimo de 3 caracteres')).toBeVisible()
    await expect(page.getByText('E-mail inválido')).toBeVisible()
    await expect(page.getByText('A senha deve ter ao menos 8 caracteres')).toBeVisible()
    await expect(page.getByText('As senhas não coincidem')).toBeVisible()

    await page.getByRole('textbox', { name: 'Nome de usuário' }).fill('ana-ribeiro')
    await page.getByRole('textbox', { name: 'E-mail' }).fill('ana@kurio.test')
    await page.getByLabel('Senha', { exact: true }).fill('senha-segura-1')
    await page.getByLabel('Confirmar senha').fill('senha-segura-1')
    await page.getByRole('button', { name: /Criar (conta|perfil)/ }).click()
    await expect(page.getByText('Este e-mail já está cadastrado.')).toBeVisible()
  })

  test('login com senha errada falha e com a correta retoma o destino @mobile', async ({
    page,
  }) => {
    await openApp(page, '/entrar?redirect=/carrinho')
    await page.getByRole('textbox', { name: 'E-mail' }).fill('ana@kurio.test')
    await page.getByLabel('Senha', { exact: true }).fill('senha-errada')
    await page.getByRole('button', { name: 'Entrar', exact: true }).first().click()
    await expect(
      page.getByRole('alert').filter({ hasText: 'E-mail ou senha inválidos.' }),
    ).toBeVisible()

    await page.getByLabel('Senha', { exact: true }).fill('kurio-ana-2026')
    await page.getByRole('button', { name: 'Entrar', exact: true }).first().click()
    await expect(page).toHaveURL(/\/carrinho$/)
  })

  test('redirecionamento externo é descartado após o login', async ({ page }) => {
    await loginViaUi(page, 'ana', 'https://malicioso.example/roubo')
    await expect(page).toHaveURL(/localhost:\d+\/$/)
  })

  test('sessão expirada preserva o contexto e permite retomar @mobile', async ({ page }) => {
    await loginViaApi(page, 'ana', '/perfil/carteiras')
    await expect(page.getByRole('heading', { name: 'Carteira principal' })).toBeVisible()
    await mock.expireSessions(page)

    await page.reload()
    await expect(page).toHaveURL(/\/entrar\?.*expired=1/)
    await expect(page.getByText(/Sua sessão expirou/).first()).toBeVisible()
    expect(decodeURIComponent(new URL(page.url()).search)).toContain('redirect=/perfil/carteiras')

    await page.getByRole('textbox', { name: 'E-mail' }).fill('ana@kurio.test')
    await page.getByLabel('Senha', { exact: true }).fill('kurio-ana-2026')
    await page.getByRole('button', { name: 'Entrar', exact: true }).first().click()
    await expect(page).toHaveURL(/\/perfil\/carteiras$/)
  })

  test('logout e troca de usuário não vazam dados privados @mobile', async ({ page, isMobile }) => {
    await loginViaUi(page, 'ana', '/favoritos')
    await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible()

    await page.evaluate(() => {
      localStorage.setItem('kurio:order-attempt:user-ana', '{"input":{}}')
      localStorage.setItem('kurio:pending-order:user-ana', 'order-1')
      localStorage.setItem('kurio:idempotency:order:quote-1', 'idem-1')
    })

    await logoutViaUi(page, isMobile)
    const leftovers = await page.evaluate(() =>
      Object.keys(localStorage).filter((key) =>
        /^kurio:(order-attempt|pending-order|idempotency|session-token)/.test(key),
      ),
    )
    expect(leftovers).toEqual([])
    await openApp(page, '/favoritos')
    await expect(page).toHaveURL(/\/entrar/)

    await loginViaUi(page, 'bruno', '/favoritos')
    await expect(page.getByText('Você ainda não favoritou nenhum NFT')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toHaveCount(0)
  })

  test('falha transitória ao validar a sessão não expira o login @mobile', async ({ page }) => {
    await loginViaApi(page, 'ana', '/')
    await mock.scenario(page, { failure: 'server-error', scope: ['/api/auth/session'] })

    await openApp(page, '/perfil')
    await expect(
      page.getByRole('alert').getByText('Não foi possível abrir esta página'),
    ).toBeVisible()
    await expect(page).toHaveURL(/\/perfil$/)

    await mock.scenario(page, { failure: 'none', scope: [] })
    await page.getByRole('button', { name: 'Tentar novamente' }).click()
    await expect(
      page.getByRole('heading', { name: /Ana Ribeiro|Meu perfil|Perfil/ }).first(),
    ).toBeVisible()
    await expect(page).not.toHaveURL(/entrar/)
  })
})
