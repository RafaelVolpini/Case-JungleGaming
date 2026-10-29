import { expect, type Locator, type Page } from '@playwright/test'

export async function expectMinimumBlocked(page: Page, group: Locator, quantity: string) {
  const decrease = group.getByRole('button', { name: 'Diminuir quantidade' })
  const increase = group.getByRole('button', { name: 'Aumentar quantidade' })

  await expect(decrease).toHaveAttribute('aria-disabled', 'true')
  await expect(decrease).toHaveAttribute('title', 'Quantidade mínima: 1')
  await expect(increase).not.toHaveAttribute('aria-disabled', 'true')
  const look = (button: Locator) =>
    button.evaluate((el) => {
      const style = getComputedStyle(el)
      return [style.backgroundColor, style.color, style.boxShadow].join('|')
    })
  expect(await look(decrease)).not.toBe(await look(increase))

  await decrease.click({ force: true })
  await expect(page.getByText('A quantidade mínima é 1.')).toBeVisible()
  await expect(group.locator('output')).toHaveText(quantity)
}
