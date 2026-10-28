type CookieIndex = Record<string, Record<string, Record<string, Cookie>>>

type CookieJson = { key?: string; value?: string; domain?: string; path?: string }

export class Cookie {
  key: string
  value: string
  domain: string | null
  path: string | null

  constructor({ key = '', value = '', domain = null, path = null }: Partial<Cookie> = {}) {
    this.key = key
    this.value = value
    this.domain = domain
    this.path = path
  }

  static fromJSON(raw: string | CookieJson | null): Cookie | null {
    if (!raw) return null
    return new Cookie(typeof raw === 'string' ? (JSON.parse(raw) as CookieJson) : raw)
  }

  static parse(header: string): Cookie | null {
    const [pair = '', ...attributes] = header.split(';')
    const separator = pair.indexOf('=')
    if (separator < 1) return null
    const cookie = new Cookie({
      key: pair.slice(0, separator).trim(),
      value: pair.slice(separator + 1).trim(),
    })
    for (const attribute of attributes) {
      const [name = '', value = ''] = attribute.split('=')
      const label = name.trim().toLowerCase()
      if (label === 'domain') cookie.domain = value.trim().replace(/^\./, '')
      if (label === 'path') cookie.path = value.trim()
    }
    return cookie
  }

  toJSON(): CookieJson {
    return { key: this.key, value: this.value, domain: this.domain ?? '', path: this.path ?? '/' }
  }

  toString(): string {
    return `${this.key}=${this.value}`
  }
}

export class MemoryCookieStore {
  idx: CookieIndex = {}
}

function domainMatches(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`)
}

export class CookieJar {
  private readonly store: MemoryCookieStore

  constructor(store: MemoryCookieStore) {
    this.store = store
  }

  getCookiesSync(url: string): Cookie[] {
    const { hostname, pathname } = new URL(url)
    const matches: Cookie[] = []
    for (const domain of Object.keys(this.store.idx)) {
      if (!domainMatches(hostname, domain)) continue
      const paths = this.store.idx[domain] ?? {}
      for (const path of Object.keys(paths)) {
        if (pathname.startsWith(path)) matches.push(...Object.values(paths[path] ?? {}))
      }
    }
    return matches
  }

  async setCookie(raw: string | Cookie, url: string): Promise<void> {
    const cookie = typeof raw === 'string' ? Cookie.parse(raw) : raw
    if (!cookie) return
    const domain = cookie.domain ?? new URL(url).hostname
    const path = cookie.path ?? '/'
    cookie.domain = domain
    cookie.path = path
    const byDomain = (this.store.idx[domain] ??= {})
    const byPath = (byDomain[path] ??= {})
    byPath[cookie.key] = cookie
  }
}
