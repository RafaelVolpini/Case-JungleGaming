import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from '@playwright/test'
import * as chromeLauncher from 'chrome-launcher'

import { PAGES, PROFILES, RUNS, SERVERS, TARGETS } from './config.mjs'
import { startHost } from './host.mjs'
import { auditPage, summarizeMedian, summarizeRun } from './measure.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const REPORTS = join(ROOT, 'lighthouse', process.env.LH_OUT ?? 'reports')
const ONLY_PAGE = process.env.LH_PAGE
const ONLY_PROFILE = process.env.LH_PROFILE
const RUN_COUNT = Number(process.env.LH_RUNS ?? RUNS)
const SERVER = process.env.LH_SERVER ?? 'h2'
const EXTERNAL_URL = process.env.LH_URL?.replace(/\/$/, '')
const BASE_URL = EXTERNAL_URL ?? SERVERS[SERVER]

const SERVER_LABELS = {
  h2: 'HTTP/2 + Brotli (lighthouse/serve.mjs)',
  preview: 'vite preview (HTTP/1.1)',
}
const SERVER_LABEL = EXTERNAL_URL ? `URL pública (${EXTERNAL_URL})` : SERVER_LABELS[SERVER]

function launchChrome() {
  return chromeLauncher.launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu', '--ignore-certificate-errors'],
  })
}

async function measure(chrome, page, profileName) {
  const runs = []
  for (let run = 1; run <= RUN_COUNT; run += 1) {
    const result = await auditPage({ chrome, url: `${BASE_URL}${page.path}`, profileName })
    const [json, html] = result.report
    const base = join(REPORTS, `${page.id}-${profileName}-run${run}`)
    writeFileSync(`${base}.json`, json)
    writeFileSync(`${base}.html`, html)
    runs.push(summarizeRun(result.lhr))
    console.log(`${page.id}/${profileName} #${run}`, JSON.stringify(runs.at(-1).scores))
  }
  return { page: page.id, profile: profileName, runs, median: summarizeMedian(runs) }
}

async function environment() {
  const { default: pkg } = await import('lighthouse/package.json', { with: { type: 'json' } })
  return {
    lighthouse: pkg.version,
    chrome: 'Chromium do Playwright',
    server: SERVER_LABEL,
    node: process.version,
    platform: `${process.platform} ${process.arch}`,
    targets: TARGETS,
  }
}

async function main() {
  mkdirSync(REPORTS, { recursive: true })
  const host = EXTERNAL_URL
    ? { kill: () => {} }
    : await startHost({ server: SERVER, baseUrl: BASE_URL, root: ROOT })
  const summary = { generatedAt: new Date().toISOString(), runs: RUN_COUNT, results: [] }

  try {
    const chrome = await launchChrome()
    try {
      for (const page of PAGES.filter((item) => !ONLY_PAGE || item.id === ONLY_PAGE)) {
        for (const profileName of Object.keys(PROFILES).filter(
          (name) => !ONLY_PROFILE || name === ONLY_PROFILE,
        )) {
          summary.results.push(await measure(chrome, page, profileName))
        }
      }
      summary.environment = await environment()
    } finally {
      await chrome.kill()
    }
  } finally {
    host.kill()
  }

  writeFileSync(join(REPORTS, 'summary.json'), JSON.stringify(summary, null, 2))
  console.log('Resumo salvo em', join(REPORTS, 'summary.json'))
  await import('./report.mjs')
}

await main()
