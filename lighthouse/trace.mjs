import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium, devices } from '@playwright/test'
import { SourceMapConsumer } from 'source-map-js'

import { startServer } from './serve.mjs'

const DIST_ASSETS = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'assets')
const PORT = Number(process.env.TRACE_PORT ?? 4447)
const PATH = process.env.TRACE_PATH ?? '/'
const RUNS = Number(process.env.TRACE_RUNS ?? 3)
const SETTLE_MS = Number(process.env.TRACE_SETTLE_MS ?? 6000)
const CPU_RATE = Number(process.env.TRACE_CPU ?? 4)
const VERBOSE = process.env.TRACE_VERBOSE === '1'
const TOP_SOURCES = Number(process.env.TRACE_SOURCES ?? 12)
const TOP_FUNCTIONS = Number(process.env.TRACE_TOP ?? 0)
const LONG_TASK_MS = Number(process.env.TRACE_LONG_MS ?? 50)
const CATEGORIES = [
  'devtools.timeline',
  'v8.execute',
  'disabled-by-default-devtools.timeline',
  'loading',
  'v8',
]

const OBSERVERS = `
  window.__perf = { fcp: null, lcp: null, lcpTarget: null, cls: 0 }
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) if (entry.name === 'first-contentful-paint') window.__perf.fcp = entry.startTime
  }).observe({ type: 'paint', buffered: true })
  new PerformanceObserver((list) => {
    const last = list.getEntries().at(-1)
    window.__perf.lcp = last.startTime
    window.__perf.lcpTarget = (last.element?.tagName ?? '') + ' ' + (last.url || last.element?.className?.toString().slice(0, 40) || '')
  }).observe({ type: 'largest-contentful-paint', buffered: true })
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__perf.cls += entry.value
  }).observe({ type: 'layout-shift', buffered: true })
`

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

function hostLoopMs() {
  const start = performance.now()
  let acc = 0
  for (let index = 0; index < 4e7; index += 1) acc += index % 7
  return Math.round(performance.now() - start + (acc > 0 ? 0 : 1))
}

function rendererThread(events) {
  const totals = new Map()
  for (const event of events) {
    if (event.name !== 'RunTask' || event.ph !== 'X') continue
    const key = `${event.pid}:${event.tid}`
    totals.set(key, (totals.get(key) ?? 0) + event.dur)
  }
  const [best] = [...totals].sort((a, b) => b[1] - a[1])
  return best?.[0]
}

const consumers = new Map()

function consumerFor(script) {
  if (!consumers.has(script)) {
    const file = join(DIST_ASSETS, `${script}.map`)
    consumers.set(
      script,
      existsSync(file) ? new SourceMapConsumer(JSON.parse(readFileSync(file, 'utf8'))) : null,
    )
  }
  return consumers.get(script)
}

function originOf(frame, script) {
  const position = consumerFor(script)?.originalPositionFor({
    line: frame.lineNumber + 1,
    column: frame.columnNumber,
  })
  if (!position?.source) return { source: script, name: frame.functionName || '(anon)' }
  const packaged = position.source.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/)
  const source = packaged ? packaged[1] : position.source.replace(/^(\.\.\/)+/, '')
  return { source, name: position.name ?? (frame.functionName || '(anon)'), line: position.line }
}

function selfTimes(profile) {
  const nodes = new Map(profile.nodes.map((node) => [node.id, node]))
  const bySource = new Map()
  const byFunction = new Map()
  profile.samples.forEach((id, index) => {
    const frame = nodes.get(id).callFrame
    if (frame.functionName === '(idle)') return
    const script = (frame.url || frame.functionName).split('/').pop()
    const origin = originOf(frame, script)
    const ms = (profile.timeDeltas[index] ?? 0) / 1000
    const key = `${origin.source} ${origin.name}${origin.line ? `:${origin.line}` : ''}`
    bySource.set(origin.source, (bySource.get(origin.source) ?? 0) + ms)
    byFunction.set(key, (byFunction.get(key) ?? 0) + ms)
  })
  return { bySource, byFunction }
}

function attribute(events, task) {
  const sums = new Map()
  for (const event of events) {
    if (event.ph !== 'X' || !['FunctionCall', 'TimerFire', 'EvaluateScript'].includes(event.name))
      continue
    if (event.ts < task.ts || event.ts + event.dur > task.ts + task.dur) continue
    const data = event.args?.data ?? {}
    const label = `${event.name} ${(data.url ?? data.functionName ?? '').split('/').pop()}`.trim()
    sums.set(label, Math.max(sums.get(label) ?? 0, event.dur / 1000))
  }
  return [...sums]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([label, ms]) => `${label} ${Math.round(ms)}ms`)
}

async function measure(browser) {
  const context = await browser.newContext({
    ...devices['Pixel 7'],
    ignoreHTTPSErrors: true,
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  await page.addInitScript(OBSERVERS)
  const session = await context.newCDPSession(page)
  await session.send('Network.enable')
  await session.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  })
  await session.send('Emulation.setCPUThrottlingRate', { rate: CPU_RATE })
  await session.send('Profiler.enable')
  await session.send('Profiler.setSamplingInterval', { interval: 250 })
  await session.send('Profiler.start')
  await browser.startTracing(page, { categories: CATEGORIES })
  await page.goto(`https://localhost:${PORT}${PATH}`, { waitUntil: 'load' })
  await page.waitForTimeout(SETTLE_MS)
  const trace = JSON.parse((await browser.stopTracing()).toString())
  const { profile } = await session.send('Profiler.stop')
  const perf = await page.evaluate(() => window.__perf)
  await context.close()
  return { events: trace.traceEvents, perf, profile }
}

function eventTotals(events, thread) {
  const totals = new Map()
  for (const event of events) {
    if (event.ph !== 'X' || event.name === 'RunTask' || `${event.pid}:${event.tid}` !== thread)
      continue
    if (event.dur < 3000) continue
    totals.set(event.name, Math.max(totals.get(event.name) ?? 0, event.dur / 1000))
  }
  return totals
}

const SUMMED = [
  'Layout',
  'UpdateLayoutTree',
  'Paint',
  'PrePaint',
  'Layerize',
  'ParseHTML',
  'v8.compile',
  'v8.compileModule',
  'V8.GC_MC_INCREMENTAL',
  'MinorGC',
  'MajorGC',
  'v8.evaluateModule',
  'EvaluateScript',
  'ImageDecodeTask',
  'Decode Image',
  'FunctionCall',
  'TimerFire',
  'RunMicrotasks',
  'XHRReadyStateChange',
  'EventDispatch',
]

function eventSums(events, thread) {
  const sums = new Map()
  for (const event of events) {
    if (event.ph !== 'X' || `${event.pid}:${event.tid}` !== thread || !SUMMED.includes(event.name))
      continue
    sums.set(event.name, (sums.get(event.name) ?? 0) + event.dur / 1000)
  }
  return sums
}

function breakdown(events, profile, task, thread) {
  const nodes = new Map(profile.nodes.map((node) => [node.id, node]))
  const sources = new Map()
  let clock = profile.startTime
  profile.samples.forEach((id, index) => {
    clock += profile.timeDeltas[index] ?? 0
    if (clock < task.ts || clock > task.ts + task.dur) return
    const frame = nodes.get(id).callFrame
    if (frame.functionName === '(idle)') return
    const script = (frame.url || frame.functionName).split('/').pop()
    const origin = originOf(frame, script)
    const key = `${origin.source} ${origin.name}`
    sources.set(key, (sources.get(key) ?? 0) + (profile.timeDeltas[index + 1] ?? 0) / 1000)
  })
  const kinds = new Map()
  for (const event of events) {
    if (event.ph !== 'X' || event.name === 'RunTask' || `${event.pid}:${event.tid}` !== thread)
      continue
    if (event.ts < task.ts || event.ts + event.dur > task.ts + task.dur || event.dur < 1500)
      continue
    kinds.set(event.name, Math.max(kinds.get(event.name) ?? 0, event.dur / 1000))
  }
  const top = (map, count) =>
    [...map]
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([label, ms]) => `${label} ${ms.toFixed(1)}`)
  return { sources: top(sources, 6), kinds: top(kinds, 5) }
}

function analyze({ events, perf, profile }) {
  const thread = rendererThread(events)
  const tasks = events
    .filter(
      (event) =>
        event.name === 'RunTask' && event.ph === 'X' && `${event.pid}:${event.tid}` === thread,
    )
    .sort((a, b) => a.ts - b.ts)
  const origin = tasks[0]?.ts ?? 0
  const fcp = perf.fcp ?? 0
  const long = tasks
    .filter((task) => task.dur / 1000 > LONG_TASK_MS)
    .map((task) => ({
      at: Math.round((task.ts - origin) / 1000),
      ms: Math.round(task.dur / 1000),
      what: attribute(events, task).join(' | '),
      detail: process.env.TRACE_BREAKDOWN === '1' ? breakdown(events, profile, task, thread) : null,
    }))
  const blocking = long
    .filter((task) => task.at >= fcp - 400)
    .reduce((sum, task) => sum + task.ms - LONG_TASK_MS, 0)
  return {
    fcp,
    lcp: perf.lcp ?? 0,
    lcpTarget: perf.lcpTarget,
    cls: perf.cls,
    long,
    blocking,
    cpu: [...selfTimes(profile).bySource.values()].reduce((sum, ms) => sum + ms, 0),
    blockingAll: long.reduce((sum, task) => sum + task.ms - LONG_TASK_MS, 0),
    byEvent: eventTotals(events, thread),
    bySum: eventSums(events, thread),
    layouts: events
      .filter(
        (e) =>
          e.name === 'Layout' && e.ph === 'X' && `${e.pid}:${e.tid}` === thread && e.dur > 8000,
      )
      .map(
        (e) =>
          `t=${Math.round((e.ts - origin) / 1000)} ${Math.round(e.dur / 1000)}ms dirty=${e.args?.beginData?.dirtyObjects} total=${e.args?.beginData?.totalObjects} partial=${e.args?.beginData?.partialLayout}`,
      ),
    ...selfTimes(profile),
  }
}

function printRun(run, index) {
  console.log(
    `run ${index + 1}: FCP ${Math.round(run.fcp)} | LCP ${Math.round(run.lcp)} (${run.lcpTarget}) | long tasks ${run.long.length} | TBT~ ${Math.round(run.blocking)} ms`,
  )
  if (!VERBOSE) return
  if (process.env.TRACE_LAYOUT === '1')
    for (const line of run.layouts) console.log(`    layout ${line}`)
  for (const task of run.long)
    console.log(
      `    t=${String(task.at).padStart(5)}  ${String(task.ms).padStart(4)} ms  ${task.what}`,
    ) ||
      (task.detail &&
        console.log(
          `         kinds: ${task.detail.kinds.join(' | ')}
         cpu: ${task.detail.sources.join(' | ')}`,
        ))
}

function printMedians(runs) {
  const med = (pick) => Math.round(median(runs.map(pick)))
  console.log(
    `MEDIAN of ${runs.length}: FCP ${med((r) => r.fcp)} ms | LCP ${med((r) => r.lcp)} ms | long tasks ${med((r) => r.long.length)} | TBT~ ${med((r) => r.blocking)} ms | TBT-all ${med((r) => r.blockingAll)} ms | worst task ${med((r) => Math.max(0, ...r.long.map((t) => t.ms)))} ms | CPU total ${med((r) => r.cpu)} ms`,
  )
  const sum = (key, count) => {
    const labels = new Set(runs.flatMap((run) => [...run[key].keys()]))
    return [...labels]
      .map((label) => [label, median(runs.map((run) => run[key].get(label) ?? 0))])
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
  }
  console.log('self time by source (median, throttled ms):')
  for (const [label, ms] of sum('bySource', TOP_SOURCES))
    console.log(`  ${String(Math.round(ms)).padStart(5)}  ${label}`)
  if (process.env.TRACE_SUMS === '1') {
    console.log('total time by event type (median, throttled ms):')
    for (const [label, ms] of sum('bySum', 20))
      console.log(`  ${String(Math.round(ms)).padStart(5)}  ${label}`)
  }
  if (process.env.TRACE_EVENTS === '1') {
    console.log('longest single event by name (median, throttled ms):')
    for (const [label, ms] of sum('byEvent', 16))
      console.log(`  ${String(Math.round(ms)).padStart(5)}  ${label}`)
  }
  if (TOP_FUNCTIONS === 0) return
  console.log('top functions:')
  for (const [label, ms] of sum('byFunction', TOP_FUNCTIONS))
    console.log(`  ${String(Math.round(ms)).padStart(5)}  ${label}`)
}

function printModules(events) {
  const thread = rendererThread(events)
  const first = events.find((e) => e.name === 'RunTask' && `${e.pid}:${e.tid}` === thread)?.ts ?? 0
  for (const event of events) {
    if (!['v8.evaluateModule', 'v8.compileModule', 'v8.compile', 'v8.run'].includes(event.name))
      continue
    if (event.ph !== 'X' || `${event.pid}:${event.tid}` !== thread || event.dur < 1500) continue
    const url = event.args?.fileName ?? event.args?.data?.url ?? ''
    console.log(
      `    ${event.name} t=${Math.round((event.ts - first) / 1000)} ${(event.dur / 1000).toFixed(1)} ms ${url.split('/').pop()}`,
    )
  }
}

const server = await startServer(PORT)
const browser = await chromium.launch({ args: ['--ignore-certificate-errors'] })
console.log(`trace ${PATH} (CPU ${CPU_RATE}x, 1.6 Mbps, 150 ms RTT) | host loop ${hostLoopMs()} ms`)
const runs = []
for (let run = 0; run < RUNS; run += 1) {
  const sample = await measure(browser)
  if (process.env.TRACE_MODULES === '1') printModules(sample.events)
  runs.push(analyze(sample))
  printRun(runs[run], run)
}
printMedians(runs)
await browser.close()
server.close()
