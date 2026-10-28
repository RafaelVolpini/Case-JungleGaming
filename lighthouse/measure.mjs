import lighthouse from 'lighthouse'

import { CATEGORIES, PROFILES } from './config.mjs'

const METRICS = {
  lcp: 'largest-contentful-paint',
  cls: 'cumulative-layout-shift',
  tbt: 'total-blocking-time',
  fcp: 'first-contentful-paint',
  si: 'speed-index',
}

export function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

export function auditPage({ chrome, url, profileName }) {
  const settings = {
    ...PROFILES[profileName],
    onlyCategories: CATEGORIES,
    disableStorageReset: false,
  }
  return lighthouse(
    url,
    { port: chrome.port, output: ['json', 'html'], logLevel: 'error' },
    { extends: 'lighthouse:default', settings },
  )
}

export function summarizeRun({ categories, audits, environment }) {
  return {
    benchmark: Math.round(environment.benchmarkIndex),
    scores: Object.fromEntries(
      CATEGORIES.map((id) => [id, Math.round(categories[id].score * 100)]),
    ),
    ...Object.fromEntries(
      Object.entries(METRICS).map(([key, auditId]) => [key, audits[auditId].numericValue]),
    ),
  }
}

export function summarizeMedian(runs) {
  return {
    scores: Object.fromEntries(
      CATEGORIES.map((id) => [id, median(runs.map((run) => run.scores[id]))]),
    ),
    ...Object.fromEntries(
      Object.keys(METRICS).map((key) => [key, median(runs.map((run) => run[key]))]),
    ),
  }
}
