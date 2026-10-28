import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = process.env.LH_OUT ?? 'reports'
const summary = JSON.parse(readFileSync(join(ROOT, 'lighthouse', OUT, 'summary.json'), 'utf8'))
const targets = summary.environment?.targets ?? {}

const PAGE_LABELS = { inicio: 'Início', detalhe: 'Detalhe do NFT' }
const CATEGORY_LABELS = {
  performance: 'Performance',
  accessibility: 'Accessibility',
  'best-practices': 'Best Practices',
  seo: 'SEO',
}

const seconds = (ms) => `${(ms / 1000).toFixed(2)} s`
const mark = (id, value) => (value >= (targets[id] ?? 0) ? `${value}` : `**${value}** ⚠️`)

const rows = summary.results.map((result) => {
  const { scores, lcp, cls, tbt } = result.median
  const columns = Object.keys(CATEGORY_LABELS).map((id) => mark(id, scores[id]))
  return `| ${PAGE_LABELS[result.page]} | ${result.profile} | ${columns.join(' | ')} | ${seconds(lcp)} | ${cls.toFixed(3)} | ${Math.round(tbt)} ms |`
})

const runs = summary.results.flatMap((result) =>
  result.runs.map(
    (run, index) =>
      `| ${PAGE_LABELS[result.page]} | ${result.profile} | ${index + 1} | ${Object.keys(
        CATEGORY_LABELS,
      )
        .map((id) => run.scores[id])
        .join(' | ')} | ${seconds(run.lcp)} | ${run.cls.toFixed(3)} | ${Math.round(run.tbt)} ms |`,
  ),
)

const header = `| ${Object.values(CATEGORY_LABELS).join(' | ')} | LCP | CLS | TBT |`
const separator = `| ${[...Object.values(CATEGORY_LABELS), 'LCP', 'CLS', 'TBT'].map(() => '---:').join(' | ')} |`
const environment = summary.environment ?? {}

const text = `# Resultados do Lighthouse

Gerado em ${summary.generatedAt}. Mediana de ${summary.runs} medições por página e perfil.

## Mediana por página e perfil

| Página | Perfil ${header}
| --- | --- ${separator}
${rows.join('\n')}

Metas: ${Object.entries(targets)
  .map(([id, value]) => `${CATEGORY_LABELS[id]} ≥ ${value}`)
  .join(', ')}. Valores abaixo da meta aparecem em negrito.

## Medições individuais

| Página | Perfil | Execução ${header}
| --- | --- | ---: ${separator}
${runs.join('\n')}

## Ambiente

- Lighthouse: ${environment.lighthouse}
- Servidor: ${environment.server}
- Navegador: Chromium do Playwright, headless
- Node: ${environment.node}
- Plataforma: ${environment.platform}
- Perfil mobile: emulação 390×844, DPR 2, throttling simulado do Lighthouse (4G lenta, CPU 4×)
- Perfil desktop: emulação 1350×940, throttling simulado do Lighthouse (rede cabeada, CPU 1×)
- Cenário dos mocks: padrão (latência \`fast\`, sem falhas), armazenamento limpo a cada execução
`

writeFileSync(
  join(ROOT, 'lighthouse', OUT === 'reports' ? 'RESULTS.md' : `${OUT}/RESULTS.md`),
  text,
)
console.log('Relatório em lighthouse/RESULTS.md')
