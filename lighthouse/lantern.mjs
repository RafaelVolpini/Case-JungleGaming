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

async function compute() {
  const artifacts = JSON.parse(readFileSync(join(ARTIFACTS, 'artifacts.json'), 'utf8'))
  const files = readdirSync(ARTIFACTS)
  const trace = JSON.parse(
    readFileSync(
      join(
        ARTIFACTS,
        files.find((file) => /trace/i.test(file)),
      ),
      'utf8',
    ),
  )
  const devtoolsLog = JSON.parse(
    readFileSync(
      join(
        ARTIFACTS,
        files.find((file) => /devtoolslog/i.test(file)),
      ),
      'utf8',
    ),
  )
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
  const tbt = await LanternTotalBlockingTime.request(data, context)
  return { lcp, tbt, bench: Math.round(artifacts.BenchmarkIndex ?? 0) }
}

const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]
const RUNS = Number(process.env.LANTERN_RUNS ?? 1)
const reuse = process.env.LANTERN_REUSE === '1' && existsSync(ARTIFACTS)
const results = []

for (let run = 0; run < RUNS; run += 1) {
  if (!reuse) await gather()
  const { lcp, tbt, bench } = await compute()
  results.push({ lcp: lcp.timing, tbt: tbt.timing, bench })
  console.log(
    `run ${run + 1}: LCP ${Math.round(lcp.timing)} (opt ${Math.round(lcp.optimisticEstimate.timeInMs)} / pess ${Math.round(lcp.pessimisticEstimate.timeInMs)}) | TBT ${Math.round(tbt.timing)} | bench ${bench}`,
  )
  if (RUNS === 1) {
    if (SHOW === 'both' || SHOW === 'optimistic')
      printTimeline('optimistic', lcp.optimisticEstimate)
    if (SHOW === 'both' || SHOW === 'pessimistic')
      printTimeline('pessimistic', lcp.pessimisticEstimate)
  }
}
if (RUNS > 1) {
  console.log(
    `MEDIAN of ${RUNS}: LCP ${Math.round(median(results.map((r) => r.lcp)))} | TBT ${Math.round(median(results.map((r) => r.tbt)))}`,
  )
}
