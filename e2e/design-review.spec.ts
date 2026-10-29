import { expect, test, type Locator, type Page } from '@playwright/test'

import { addToCart, catalogCards, loginViaApi, openApp } from './support/app'

type Box = { x: number; y: number; width: number; height: number }

async function box(locator: Locator): Promise<Box> {
  const found = await locator.boundingBox()
  if (!found) throw new Error('elemento sem caixa de layout')
  return found
}

const bottom = (b: Box) => b.y + b.height
const right = (b: Box) => b.x + b.width
const centerX = (b: Box) => b.x + b.width / 2
const centerY = (b: Box) => b.y + b.height / 2

async function fillCart(page: Page) {
  await openApp(page)
  await addToCart(page, 'emerald-ape-042', { quantity: 2 })
  await addToCart(page, 'violet-nomad-314', { quantity: 1 })
  await openApp(page, '/carrinho')
}

test.describe('revisão de design: catálogo', () => {
  test('coleções aparecem em ordem alfabética @mobile', async ({ page, isMobile }) => {
    await openApp(page)
    if (isMobile) await page.getByRole('button', { name: 'Abrir filtros' }).click()
    const options = page.locator('section[aria-label="Coleções"] button')
    await expect(options.nth(5)).toBeVisible()
    const names = await options.evaluateAll((buttons) =>
      buttons.map((button) => (button.textContent ?? '').replace(/\(\d+\)/, '').trim()),
    )
    expect(names.length).toBeGreaterThan(5)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'pt-BR')))
  })

  test('os pontos do destaque ficam abaixo da imagem e centralizados nela', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'os pontos do banner mobile ficam dentro do banner')
    await openApp(page)
    const image = box(
      page.locator('section[aria-labelledby="hero-title"] img[aria-hidden="false"]'),
    )
    const dots = box(page.getByRole('group', { name: 'Destaques' }))
    const [imageBox, dotsBox] = await Promise.all([image, dots])
    expect(dotsBox.y).toBeGreaterThanOrEqual(bottom(imageBox) + 16)
    expect(Math.abs(centerX(dotsBox) - centerX(imageBox))).toBeLessThanOrEqual(4)
  })

  test('os cards têm o mesmo respiro nos quatro lados da imagem @mobile', async ({ page }) => {
    await openApp(page)
    await expect(catalogCards(page).first()).toBeVisible()
    const insets = await catalogCards(page).evaluateAll((cards) =>
      cards.slice(0, 9).map((card) => {
        const frame = card.querySelector('a > div')?.getBoundingClientRect()
        const image = card.querySelector('img')?.getBoundingClientRect()
        if (!frame || !image) return null
        return [
          image.left - frame.left,
          frame.right - image.right,
          image.top - frame.top,
          frame.bottom - image.bottom,
        ].map((value) => Math.round(value))
      }),
    )
    for (const inset of insets) {
      expect(inset).not.toBeNull()
      expect(Math.max(...(inset ?? [0])) - Math.min(...(inset ?? [0]))).toBeLessThanOrEqual(1)
    }
  })

  test('"Ordenar por" tem espaço entre o rótulo e o valor', async ({ page, isMobile }) => {
    test.skip(isMobile, 'a ordenação é exclusiva do desktop')
    await openApp(page)
    const label = await box(page.locator('#sort-label'))
    const value = await box(page.getByRole('combobox', { name: /Ordenar por/ }))
    expect(value.x - right(label)).toBeGreaterThanOrEqual(6)
  })

  test('o botão Entrar do cabeçalho tem um ícone proporcional', async ({ page, isMobile }) => {
    test.skip(isMobile, 'o cabeçalho é exclusivo do desktop')
    await openApp(page)
    const button = page.locator('header').getByRole('link', { name: 'Entrar' })
    const frame = await box(button)
    const icon = await box(button.locator('svg'))
    expect(icon.height).toBeLessThanOrEqual(frame.height * 0.45)
    expect(Math.abs(centerY(icon) - centerY(frame))).toBeLessThanOrEqual(1)
  })

  test('os cartões promocionais têm margem entre imagem, texto e botão', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'os cartões promocionais são exclusivos do desktop')
    await openApp(page)
    const cards = page.locator('section[aria-label="Destaques da Kurio"] article')
    await expect(cards).toHaveCount(2)
    for (let index = 0; index < 2; index += 1) {
      const card = cards.nth(index)
      await card.scrollIntoViewIfNeeded()
      const image = await box(card.locator('img'))
      const text = await box(card.locator('h3'))
      const description = await box(card.locator('p'))
      const action = await box(card.getByRole('link', { name: /Explorar/ }))
      const frame = await box(card)
      expect(text.x - right(image)).toBeGreaterThanOrEqual(12)
      expect(action.y - bottom(description)).toBeGreaterThanOrEqual(12)
      expect(right(frame) - right(action)).toBeGreaterThanOrEqual(16)
      expect(bottom(frame) - bottom(action)).toBeGreaterThanOrEqual(16)
    }
  })

  test('o banner mobile não tem imagem sobreposta e deixa margem antes das abas @mobile', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'o banner mobile é exclusivo do layout mobile')
    await openApp(page)
    const hero = page.locator('section[aria-labelledby="hero-title"]')
    await expect(hero.locator('img[alt=""]')).toHaveCount(0)
    const heroBox = await box(hero)
    const tabs = await box(page.getByRole('tablist', { name: 'Tipo de listagem' }))
    expect(tabs.y - bottom(heroBox)).toBeGreaterThanOrEqual(20)
  })
})

test.describe('botões interativos', () => {
  test('o botão de curtir mostra o cursor de clique e responde ao clique @mobile', async ({
    page,
  }) => {
    await openApp(page)
    const like = catalogCards(page)
      .first()
      .getByRole('button', { name: /favoritos/ })
    await expect(like).toHaveCSS('cursor', 'pointer')
    await like.click()
    await expect(page).toHaveURL(/\/entrar/)
  })

  test('o botão de abrir filtros mostra o cursor de clique e abre o painel @mobile', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'o botão de filtros é exclusivo do mobile')
    await openApp(page)
    const filters = page.getByRole('button', { name: 'Abrir filtros' })
    await expect(filters).toHaveCSS('cursor', 'pointer')
    await filters.click()
    await expect(page.getByRole('dialog', { name: 'Filtros' })).toBeVisible()
  })
})

test.describe('revisão de design: carrinho', () => {
  test('o título da tabela respeita a distância do caminho de navegação', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'o caminho de navegação é exclusivo do desktop')
    await fillCart(page)
    const crumbs = await box(page.getByRole('navigation', { name: 'Caminho de navegação' }))
    const header = await box(page.locator('span', { hasText: /^NFTs$/ }).first())
    expect(header.y - bottom(crumbs)).toBeGreaterThanOrEqual(16)
  })

  test('a lixeira fica centralizada na linha e longe da borda', async ({ page, isMobile }) => {
    test.skip(isMobile, 'a linha de tabela é exclusiva do desktop')
    await fillCart(page)
    const trash = page.getByRole('button', { name: /Remover Emerald Ape/ })
    const row = await box(page.locator('li').filter({ has: trash }))
    const icon = await box(trash)
    expect(Math.abs(centerY(icon) - centerY(row))).toBeLessThanOrEqual(1)
    expect(right(row) - right(icon)).toBeGreaterThanOrEqual(6)
  })

  test('no mobile a lixeira tem espaço próprio e não toca no seletor de quantidade @mobile', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'o item compacto é exclusivo do mobile')
    await fillCart(page)
    const trash = await box(page.getByRole('button', { name: /Remover Emerald Ape/ }))
    const stepper = await box(page.getByRole('group', { name: 'Quantidade de Emerald Ape #042' }))
    expect(stepper.y - bottom(trash)).toBeGreaterThanOrEqual(8)
  })
})

test.describe('revisão de design: formulários', () => {
  test('o ícone dos selects fica centralizado na vertical e equidistante da borda @mobile', async ({
    page,
  }) => {
    await loginViaApi(page, 'ana', '/perfil/carteiras')
    const triggers = page.locator('[data-slot="select-trigger"]')
    await expect(triggers.first()).toBeVisible()
    const offsets = await triggers.evaluateAll((elements) =>
      elements.map((element) => {
        const frame = element.getBoundingClientRect()
        const icon = element.querySelector('svg')?.getBoundingClientRect()
        if (!icon) return null
        return {
          vertical: Math.abs(frame.top + frame.height / 2 - (icon.top + icon.height / 2)),
          edge: frame.right - icon.right,
        }
      }),
    )
    expect(offsets.length).toBeGreaterThan(0)
    for (const offset of offsets) {
      expect(offset?.vertical ?? 99).toBeLessThanOrEqual(1)
      expect(offset?.edge ?? 0).toBeGreaterThanOrEqual(8)
    }
  })
})

test.describe('revisão de design: recibo', () => {
  test('os totais ficam alinhados à direita, junto das colunas de valores', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'o alinhamento por colunas é exclusivo do desktop')
    test.setTimeout(60_000)
    await loginViaApi(page, 'ana', '/')
    await addToCart(page, 'golden-beat-207', { auth: true })
    await openApp(page, '/pagamento')
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await page.getByRole('button', { name: 'Confirmar e enviar' }).click()
    await expect(page.getByText('Seus NFTs agora estão na sua carteira')).toBeVisible({
      timeout: 25_000,
    })

    const fee = await box(page.getByText('Taxa de rede', { exact: true }))
    const feeValue = await box(
      page
        .locator('dd')
        .filter({ hasText: /^0\.\d+ ETH$/ })
        .first(),
    )
    const total = await box(page.getByText('Total', { exact: true }).last())
    const subtotal = await box(page.getByText('Subtotal', { exact: true }))
    expect(feeValue.x - right(fee)).toBeLessThanOrEqual(48)
    expect(Math.abs(right(total) - right(fee))).toBeLessThanOrEqual(1)
    expect(right(fee)).toBeGreaterThan(subtotal.x - 60)
  })
})

test.describe('revisão de design: rodapé', () => {
  test('o título da newsletter fica na mesma linha dos outros títulos e cabe na faixa', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'a faixa em quatro colunas é exclusiva do desktop')
    await openApp(page)
    const band = page.locator('section[aria-label="Diferenciais da Kurio"]')
    await band.scrollIntoViewIfNeeded()
    const titles = await Promise.all((await band.locator('h3').all()).map(box))
    expect(titles).toHaveLength(4)
    const newsletter = titles[3]!
    for (const title of titles.slice(0, 3)) {
      expect(Math.abs(title.y - newsletter.y)).toBeLessThanOrEqual(1)
    }
    expect(newsletter.height).toBeLessThanOrEqual(26)

    const frame = await box(band)
    const description = await box(band.locator('form p'))
    expect(bottom(description)).toBeLessThanOrEqual(bottom(frame) - 4)
    const textRight = await band.locator('form p').evaluate((paragraph) => {
      const range = document.createRange()
      range.selectNodeContents(paragraph)
      return range.getBoundingClientRect().right
    })
    expect(textRight).toBeLessThanOrEqual(right(frame) - 16)
  })
})
