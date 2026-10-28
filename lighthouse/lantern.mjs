import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from '@playwright/test'
import * as chromeLauncher from 'chrome-launcher'
import lighthouse from 'lighthouse'
import { LanternLargestContentfulPaint } from 'lighthouse/core/computed/metrics/lantern-largest-contentful-paint.js'
import { LanternTotalBlockingTime } from 'lighthouse/core/computed/metrics/lantern-total-blocking-time.js'

import { PROFILES, SERVERS } from './config.mjs'
import { startServer } from './serve.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ARTIFACTS = join(ROOT, 'lighthouse', '.tmp', 'artifacts')
const PATH = process.env.LANTERN_PATH ?? '/'
const PORT = Number(new URL(SERVERS.h2).port)
const MIN_CPU_MS = Number(process.env.LANTERN_MIN_CPU ?? 12)
const SHOW = process.env.LANTERN_SHOW ?? 'pessimistic'

function describeNode(node, timing) {
  const start = Math.round(timing.startTime)
  const end = Math.round(timing.endTime)
  if (node.type === 'network') {
    const record = node.request
    const url = record.url.replace(`https://localhost:${PORT}`, '')
    return {
      start,
      end,
      line: `NET ${String(Math.round(record.transferSize / 1024)).padStart(4)} KB  ${url.slice(0, 70)}`,
    }
  }
  return { start, end, line: `CPU ${String(Math.round(end - start)).padStart(4)} ms  (task)` }
}

function nodeName(node) {
  if (node.type === 'network') return node.request.url.split('/').pop().slice(0, 28)
  return `cpu${Math.round(node.duration / 1000)}`
}

function printTimeline(label, estimate) {
  console.log(`\n== ${label}: ${Math.round(estimate.timeInMs)} ms`)
  const rows = []
  for (const [node, timing] of estimate.nodeTimings) {
    if (node.type !== 'network' && timing.endTime - timing.startTime < MIN_CPU_MS) continue
    const row = describeNode(node, timing)
    if (process.env.LANTERN_DEPS === '1')
      row.line += `   <- ${node.getDependencies().map(nodeName).join(', ').slice(0, 90)}`
    rows.push(row)
  }
  rows.sort((a, b) => a.start - b.start)
  for (const row of rows)
    console.log(`  ${String(row.start).padStart(5)} -> ${String(row.end).padStart(5)}  ${row.line}`)
}

async function gather() {
  rmSync(ARTIFACTS, { recursive: true, force: true })
  mkdirSync(ARTIFACTS, { recursive: true })
  const server = await startServer(PORT)
  const chrome = await chromeLauncher.launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu', '--ignore-certificate-errors'],
  })
  const settings = {
    ...PROFILES.mobile,
    onlyCategories: ['performance'],
    disableStorageReset: false,
  }
  await lighthouse(
    `${SERVERS.h2}${PATH}`,
    { port: chrome.port, logLevel: 'error', gatherMode: ARTIFACTS },
    { extends: 'lighthouse:default', settings },
  )
  await chrome.kill()
  server.close()
}

if (process.env.LANTERN_REUSE !== '1' || !existsSync(ARTIFACTS)) await gather()

const artifacts = JSON.parse(readFileSync(join(ARTIFACTS, 'artifacts.json'), 'utf8'))
const files = readdirSync(ARTIFACTS)
const traceFile = files.find((file) => /trace/i.test(file))
const logFile = files.find((file) => /devtoolslog/i.test(file))
const trace = JSON.parse(readFileSync(join(ARTIFACTS, traceFile), 'utf8'))
const devtoolsLog = JSON.parse(readFileSync(join(ARTIFACTS, logFile), 'utf8'))
const context = { computedCache: new Map() }
const data = {
  trace,
  devtoolsLog,
  gatherContext: artifacts.GatherContext ?? { gatherMode: 'navigation' },
  settings: artifacts.settings,
  URL: artifacts.URL,
  SourceMaps: artifacts.SourceMaps ?? [],
  HostDPR: artifacts.HostDPR ?? 1,
}

const lcp = await LanternLargestContentfulPaint.request(data, context)
console.log(
  `LCP simulated ${Math.round(lcp.timing)} ms (optimistic ${Math.round(lcp.optimisticEstimate.timeInMs)}, pessimistic ${Math.round(lcp.pessimisticEstimate.timeInMs)})`,
)
if (SHOW === 'both' || SHOW === 'optimistic') printTimeline('optimistic', lcp.optimisticEstimate)
if (SHOW === 'both' || SHOW === 'pessimistic') printTimeline('pessimistic', lcp.pessimisticEstimate)
const tbt = await LanternTotalBlockingTime.request(data, context)
console.log(`\nTBT simulated ${Math.round(tbt.timing)} ms`)
