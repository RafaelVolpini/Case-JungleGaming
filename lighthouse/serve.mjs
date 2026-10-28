import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import { createSecureServer } from 'node:http2'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { brotliCompressSync, constants } from 'node:zlib'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const CERT_DIR = join(ROOT, 'lighthouse', '.tmp')

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
}
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json', '.svg', '.map', '.txt'])

function ensureCertificate() {
  mkdirSync(CERT_DIR, { recursive: true })
  const key = join(CERT_DIR, 'localhost.key')
  const cert = join(CERT_DIR, 'localhost.crt')
  if (!existsSync(key) || !existsSync(cert)) {
    execFileSync(
      'openssl',
      [
        'req',
        '-x509',
        '-newkey',
        'rsa:2048',
        '-nodes',
        '-days',
        '30',
        '-subj',
        '/CN=localhost',
        '-keyout',
        key,
        '-out',
        cert,
      ],
      { stdio: 'ignore' },
    )
  }
  return { key: readFileSync(key), cert: readFileSync(cert) }
}

const BACKSLASH = String.fromCharCode(92)
const cache = new Map()

function load(file) {
  const cached = cache.get(file)
  if (cached) return cached
  const body = readFileSync(file)
  const type = TYPES[extname(file)] ?? 'application/octet-stream'
  const compressed = COMPRESSIBLE.has(extname(file))
    ? brotliCompressSync(body, { params: { [constants.BROTLI_PARAM_QUALITY]: 9 } })
    : null
  const entry = { body, compressed, type }
  cache.set(file, entry)
  return entry
}

function resolveFile(pathname) {
  let clean = normalize(decodeURIComponent(pathname))
  while (clean.startsWith('/') || clean.startsWith(BACKSLASH)) clean = clean.slice(1)
  const candidate = join(DIST, clean)
  if (candidate.startsWith(DIST) && existsSync(candidate) && statSync(candidate).isFile())
    return candidate
  return join(DIST, 'index.html')
}

export function startServer(port) {
  const server = createSecureServer(
    { ...ensureCertificate(), allowHTTP1: true },
    (request, response) => {
      const { pathname } = new URL(request.url ?? '/', 'https://localhost')
      const file = resolveFile(pathname)
      const { body, compressed, type } = load(file)
      const acceptsBrotli = String(request.headers['accept-encoding'] ?? '').includes('br')
      const immutable = file.includes(`${join(DIST, 'assets')}`)
      const headers = {
        'content-type': type,
        'cache-control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
        vary: 'accept-encoding',
      }
      if (compressed && acceptsBrotli) {
        response.writeHead(200, { ...headers, 'content-encoding': 'br' })
        response.end(compressed)
      } else {
        response.writeHead(200, headers)
        response.end(body)
      }
    },
  )
  return new Promise((resolve) => server.listen(port, () => resolve(server)))
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2] ?? 4443)
  await startServer(port)
  console.log(`Servidor H2 em https://localhost:${port}`)
}
