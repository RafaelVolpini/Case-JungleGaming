import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  MEDIAN_HEADER,
  RUN_HEADER,
  environmentLines,
  htmlTable,
  markdownTable,
  medianRows,
  runRows,
} from './report-format.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = process.env.LH_OUT ?? 'reports'
const REPORTS = join(ROOT, 'lighthouse', OUT)
const README = join(ROOT, 'README.md')
const START = '<!-- lighthouse:start -->'
const END = '<!-- lighthouse:end -->'

const summary = JSON.parse(readFileSync(join(REPORTS, 'summary.json'), 'utf8'))
const targets = summary.environment?.targets ?? {}
const targetsLine = Object.entries(targets)
  .map(([id, value]) => `${id} ≥ ${value}`)
  .join(', ')
const stamp = `Gerado em ${summary.generatedAt}. Mediana de ${summary.runs} medições por página e perfil.`

function readmeBlock() {
  const environment = environmentLines(summary)
    .map((line) => `- ${line}`)
    .join('\n')
  return [
    stamp,
    '',
    markdownTable(MEDIAN_HEADER, medianRows(summary, targets)),
    '',
    `Metas do enunciado: ${targetsLine}. Valores abaixo da meta aparecem em negrito. As medições individuais, os relatórios HTML/JSON de cada execução e o resumo estão em [\`lighthouse/reports/index.html\`](lighthouse/reports/index.html).`,
    '',
    '**Ambiente e condições de execução**',
    '',
    environment,
  ].join('\n')
}

function reportLinks() {
  if (!existsSync(REPORTS)) return ''
  const files = readdirSync(REPORTS)
    .filter((name) => name.endsWith('.html') && name !== 'index.html')
    .sort()
  const items = files.map((name) => {
    const base = name.replace('.html', '')
    return `<li>${base}: <a href="${name}">HTML</a> · <a href="${base}.json">JSON</a></li>`
  })
  return `<ul>${items.join('\n')}</ul>`
}

function indexPage() {
  const environment = environmentLines(summary)
    .map((line) => `<li>${line.replaceAll('`', '')}</li>`)
    .join('')
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lighthouse — Kurio</title>
<style>
body{font:16px/1.5 system-ui,sans-serif;max-width:1000px;margin:2rem auto;padding:0 1rem;color:#222}
table{border-collapse:collapse;width:100%;margin:1rem 0}
th,td{border:1px solid #ccc;padding:.4rem .6rem;text-align:right}
th:first-child,td:first-child,th:nth-child(2),td:nth-child(2){text-align:left}
th{background:#f3f3f3}
</style>
</head>
<body>
<h1>Resultados do Lighthouse</h1>
<p>${stamp}</p>
<h2>Mediana por página e perfil</h2>
${htmlTable(MEDIAN_HEADER, medianRows(summary, targets))}
<p>Metas do enunciado: ${targetsLine}. ⚠ marca valores abaixo da meta.</p>
<h2>Medições individuais</h2>
${htmlTable(RUN_HEADER, runRows(summary))}
<h2>Ambiente</h2>
<ul>${environment}</ul>
<h2>Relatórios completos</h2>
${reportLinks()}
</body>
</html>
`
}

function updateReadme() {
  if (!existsSync(README) || OUT !== 'reports') return false
  const text = readFileSync(README, 'utf8')
  const from = text.indexOf(START)
  const to = text.indexOf(END)
  if (from < 0 || to < 0) return false
  writeFileSync(
    README,
    `${text.slice(0, from + START.length)}\n${readmeBlock()}\n${text.slice(to)}`,
  )
  return true
}

writeFileSync(join(REPORTS, 'index.html'), indexPage())
console.log(`Índice em lighthouse/${OUT}/index.html`)
if (updateReadme()) console.log('Tabela de medianas atualizada no README.md')
