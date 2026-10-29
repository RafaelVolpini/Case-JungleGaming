import { existsSync } from 'node:fs'
import { join } from 'node:path'

import type { TestInfo } from '@playwright/test'

const SCREENSHOTS = join(import.meta.dirname, '..', '__screenshots__')

export function baselineMissing(testInfo: TestInfo): boolean {
  if (testInfo.config.updateSnapshots !== 'missing') return false
  return !existsSync(join(SCREENSHOTS, testInfo.project.name, process.platform))
}

export const MISSING_BASELINE_MESSAGE =
  'Sem baseline visual para este sistema operacional. Gere com npm run test:e2e:update e revise as imagens.'
