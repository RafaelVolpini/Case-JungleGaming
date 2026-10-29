export const PAGE_LABELS = { inicio: 'Início', detalhe: 'Detalhe do NFT' }

export const CATEGORY_LABELS = {
  performance: 'Performance',
  accessibility: 'Accessibility',
  'best-practices': 'Best Practices',
  seo: 'SEO',
}

const CATEGORY_IDS = Object.keys(CATEGORY_LABELS)

export const seconds = (ms) => `${(ms / 1000).toFixed(2)} s`

function mark(targets, id, value) {
  return value >= (targets[id] ?? 0) ? `${value}` : `**${value}** ⚠️`
}

function metricCells(entry) {
  return [seconds(entry.lcp), entry.cls.toFixed(3), `${Math.round(entry.tbt)} ms`]
}

export function medianRows(summary, targets) {
  return summary.results.map((result) => {
    const { scores } = result.median
    const cells = CATEGORY_IDS.map((id) => mark(targets, id, scores[id]))
    return [PAGE_LABELS[result.page], result.profile, ...cells, ...metricCells(result.median)]
  })
}

export function runRows(summary) {
  return summary.results.flatMap((result) =>
    result.runs.map((run, index) => [
      PAGE_LABELS[result.page],
      result.profile,
      String(index + 1),
      ...CATEGORY_IDS.map((id) => String(run.scores[id])),
      ...metricCells(run),
    ]),
  )
}

export const MEDIAN_HEADER = [
  'Página',
  'Perfil',
  ...Object.values(CATEGORY_LABELS),
  'LCP',
  'CLS',
  'TBT',
]

export const RUN_HEADER = ['Página', 'Perfil', 'Execução', ...MEDIAN_HEADER.slice(2)]

export function markdownTable(header, rows) {
  const align = header.map((_, index) =>
    index < 2 || header[index] === 'Execução' ? '---' : '---:',
  )
  const lines = [header, align, ...rows].map((row) => `| ${row.join(' | ')} |`)
  return lines.join('\n')
}

export function htmlTable(header, rows) {
  const head = header.map((cell) => `<th>${cell}</th>`).join('')
  const body = rows
    .map((row) => {
      const cells = row.map((cell) => `<td>${cell.replaceAll('**', '').replace(' ⚠️', ' ⚠')}</td>`)
      return `<tr>${cells.join('')}</tr>`
    })
    .join('\n')
  return `<table><thead><tr>${head}</tr></thead><tbody>\n${body}\n</tbody></table>`
}

export function benchmarkLine(summary) {
  const values = summary.results
    .flatMap((result) => result.runs.map((run) => run.benchmark))
    .filter(Boolean)
  if (values.length === 0) return ''
  return `Índice de benchmark da CPU do host (Lighthouse): ${Math.min(...values)} a ${Math.max(...values)}. Quanto menor, mais lenta a máquina e maior o TBT medido.`
}

export function environmentLines(summary) {
  const environment = summary.environment ?? {}
  return [
    `Lighthouse: ${environment.lighthouse}`,
    `Servidor: ${environment.server}`,
    'Navegador: Chromium do Playwright, headless',
    benchmarkLine(summary),
    `Node: ${environment.node}`,
    `Plataforma: ${environment.platform}`,
    'Perfil mobile: emulação 390×844, DPR 2, throttling simulado do Lighthouse (4G lenta, CPU 4×)',
    'Perfil desktop: emulação 1350×940, throttling simulado do Lighthouse (rede cabeada, CPU 1×)',
    'Cenário dos mocks: padrão (latência `fast`, sem falhas), armazenamento limpo a cada execução',
  ].filter(Boolean)
}
