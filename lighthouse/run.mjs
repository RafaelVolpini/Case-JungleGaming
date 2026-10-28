import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from '@playwright/test'
import * as chromeLauncher from 'chrome-launcher'
import lighthouse from 'lighthouse'

import { CATEGORIES, PAGES, PROFILES, RUNS, SERVERS, TARGETS } from './config.mjs'
import { startServer } from './serve.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = process.env.LH_OUT ?? 'reports'
const REPORTS = join(ROOT, 'lighthouse', OUT)
const ONLY_PAGE = process.env.LH_PAGE
const ONLY_PROFILE = process.env.LH_PROFILE
const RUN_COUNT = Number(process.env.LH_RUNS ?? RUNS)
const SERVER = process.env.LH_SERVER ?? 'h2'
const BASE_URL = SERVERS[SERVER]
const PORT = new URL(BASE_URL).port

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

async function waitForServer() {
  if (SERVER === 'h2') return
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(BASE_URL)
      if (response.ok) return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }
  throw new Error('Servidor de preview não respondeu')
}

async function startHost() {
  if (SERVER === 'h2') {
    const server = await startServer(Number(PORT))
    return { kill: () => server.close() }
  }
  return startPreview()
}

function startPreview() {
  const command = process.platform === 'win32' ? 'npx.cmd' : 'npx'
  return spawn(command, ['vite', 'preview', '--port', PORT, '--strictPort'], {
    cwd: ROOT,
    stdio: 'ignore',
    shell: process.platform === 'win32',
  })
}

async function audit(chrome, page, profileName) {
  const settings = {
    ...PROFILES[profileName],
    onlyCategories: CATEGORIES,
    disableStorageReset: false,
  }
  return lighthouse(
    `${BASE_URL}${page.path}`,
    { port: chrome.port, output: ['json', 'html'], logLevel: 'error' },
    { extends: 'lighthouse:default', settings },
  )
}

async function main() {
  mkdirSync(REPORTS, { recursive: true })
  const preview = await startHost()
  const summary = { generatedAt: new Date().toISOString(), runs: RUN_COUNT, results: [] }

  try {
    await waitForServer()
    const chrome = await chromeLauncher.launch({
      chromePath: chromium.executablePath(),
      chromeFlags: [
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        '--ignore-certificate-errors',
      ],
    })

    try {
      for (const page of PAGES.filter((item) => !ONLY_PAGE || item.id === ONLY_PAGE)) {
        for (const profileName of Object.keys(PROFILES).filter(
          (name) => !ONLY_PROFILE || name === ONLY_PROFILE,
        )) {
          const runs = []
          for (let run = 1; run <= RUN_COUNT; run += 1) {
            const result = await audit(chrome, page, profileName)
            const [json, html] = result.report
            const base = join(REPORTS, `${page.id}-${profileName}-run${run}`)
            writeFileSync(`${base}.json`, json)
            writeFileSync(`${base}.html`, html)
            const { categories, audits } = result.lhr
            runs.push({
              scores: Object.fromEntries(
                CATEGORIES.map((id) => [id, Math.round(categories[id].score * 100)]),
              ),
              lcp: audits['largest-contentful-paint'].numericValue,
              cls: audits['cumulative-layout-shift'].numericValue,
              tbt: audits['total-blocking-time'].numericValue,
              fcp: audits['first-contentful-paint'].numericValue,
              si: audits['speed-index'].numericValue,
            })
            console.log(`${page.id}/${profileName} #${run}`, JSON.stringify(runs.at(-1).scores))
          }
          summary.results.push({
            page: page.id,
            profile: profileName,
            runs,
            median: {
              scores: Object.fromEntries(
                CATEGORIES.map((id) => [id, median(runs.map((r) => r.scores[id]))]),
              ),
              lcp: median(runs.map((r) => r.lcp)),
              cls: median(runs.map((r) => r.cls)),
              tbt: median(runs.map((r) => r.tbt)),
              fcp: median(runs.map((r) => r.fcp)),
              si: median(runs.map((r) => r.si)),
            },
          })
        }
      }
      summary.environment = {
        lighthouse: (await import('lighthouse/package.json', { with: { type: 'json' } })).default
          .version,
        chrome: (await chrome.process?.pid) ? 'Chromium do Playwright' : 'desconhecido',
        server:
          SERVER === 'h2' ? 'HTTP/2 + Brotli (lighthouse/serve.mjs)' : 'vite preview (HTTP/1.1)',
        node: process.version,
        platform: `${process.platform} ${process.arch}`,
        targets: TARGETS,
      }
    } finally {
      await chrome.kill()
    }
  } finally {
    preview.kill()
  }

  writeFileSync(join(REPORTS, 'summary.json'), JSON.stringify(summary, null, 2))
  console.log('Resumo salvo em', join(REPORTS, 'summary.json'))
  await import('./report.mjs')
}

await main()
