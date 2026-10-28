export const SERVERS = {
  h2: 'https://localhost:4443',
  preview: 'http://localhost:4174',
}
export const RUNS = 3

export const PAGES = [
  { id: 'inicio', path: '/' },
  { id: 'detalhe', path: '/nft/emerald-ape-042' },
]

export const PROFILES = {
  mobile: {
    formFactor: 'mobile',
    screenEmulation: {
      mobile: true,
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      disabled: false,
    },
    throttlingMethod: 'simulate',
  },
  desktop: {
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
    throttling: {
      rttMs: 40,
      throughputKbps: 10 * 1024,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
    },
    throttlingMethod: 'simulate',
  },
}

export const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo']

export const TARGETS = { performance: 90, accessibility: 95, 'best-practices': 95, seo: 90 }
