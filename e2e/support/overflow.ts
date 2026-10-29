import type { Page } from '@playwright/test'

import { waitForImages } from './app'

export async function horizontalLeaks(page: Page): Promise<string[]> {
  await waitForImages(page)
  await page.addStyleTag({ content: 'body{overflow-x:visible !important}' })
  return page.evaluate(() => {
    const client = document.documentElement.clientWidth
    const clippedByParent = (element: Element) => {
      for (
        let parent = element.parentElement;
        parent && parent !== document.body;
        parent = parent.parentElement
      ) {
        const { overflowX } = getComputedStyle(parent)
        const clips = ['hidden', 'clip', 'auto', 'scroll'].includes(overflowX)
        if (clips && parent.getBoundingClientRect().right <= client + 1) return true
      }
      return false
    }
    const leaks: string[] = []
    for (const element of document.querySelectorAll('body *')) {
      const rect = element.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0 || rect.right <= client + 1) continue
      if (!clippedByParent(element))
        leaks.push(`${element.tagName.toLowerCase()} right=${Math.round(rect.right)}`)
    }
    if (document.documentElement.scrollWidth > client)
      leaks.push(`documento scrollWidth=${document.documentElement.scrollWidth}`)
    return leaks.slice(0, 5)
  })
}
