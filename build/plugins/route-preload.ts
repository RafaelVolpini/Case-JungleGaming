import type { HtmlTagDescriptor, IndexHtmlTransformContext, Plugin } from 'vite'

const BACKSLASH = String.fromCharCode(92)

const COMMON_MODULES = ['src/app/mount.tsx', 'src/mocks/browser.ts', 'src/routes/_shell.tsx']

type RouteGroup = { name: string; test: string; modules: string[] }

const ROUTE_GROUPS: RouteGroup[] = [
  {
    name: 'home',
    test: "p==='/'",
    modules: [
      'src/routes/_shell/index.tsx',
      'src/features/catalog/pages/home-page.tsx',
      'src/features/catalog/pages/mobile-home-page.tsx',
    ],
  },
  {
    name: 'detail',
    test: "p.indexOf('/nft/')===0",
    modules: [
      'src/routes/_shell/nft.$slug.tsx',
      'src/features/nft-detail/pages/nft-detail-page.tsx',
      'src/features/nft-detail/pages/mobile-detail-page.tsx',
    ],
  },
]

type Bundle = NonNullable<IndexHtmlTransformContext['bundle']>
type Chunk = Extract<Bundle[string], { type: 'chunk' }>

function chunksOf(bundle: Bundle): Chunk[] {
  return Object.values(bundle).filter((item): item is Chunk => item.type === 'chunk')
}

function staticClosure(bundle: Bundle, roots: Iterable<string>): Set<string> {
  const seen = new Set<string>()
  const visit = (fileName: string) => {
    const chunk = bundle[fileName]
    if (!chunk || chunk.type !== 'chunk' || seen.has(fileName)) return
    seen.add(fileName)
    chunk.imports.forEach(visit)
  }
  for (const root of roots) visit(root)
  return seen
}

function chunksWithModules(bundle: Bundle, modules: string[]): string[] {
  return chunksOf(bundle)
    .filter((chunk) => !chunk.isEntry)
    .filter((chunk) =>
      Object.keys(chunk.modules)
        .map((id) => id.split(BACKSLASH).join('/'))
        .some((id) => modules.some((wanted) => id.includes(wanted))),
    )
    .map((chunk) => chunk.fileName)
}

function modulepreload(fileName: string): HtmlTagDescriptor {
  return {
    tag: 'link',
    attrs: { rel: 'modulepreload', crossorigin: '', href: `/${fileName}` },
    injectTo: 'head',
  }
}

function routeScript(sets: Array<{ test: string; files: string[] }>): HtmlTagDescriptor {
  const branches = sets
    .map(({ test, files }) => `if(${test})l=${JSON.stringify(files.map((file) => `/${file}`))};`)
    .join('else ')
  const code = `(function(){var p=location.pathname,l=[];${branches}var f=document.createDocumentFragment();for(var i=0;i<l.length;i++){var k=document.createElement('link');k.rel='modulepreload';k.crossOrigin='';k.href=l[i];f.appendChild(k)}document.head.appendChild(f)})()`
  return { tag: 'script', children: code, injectTo: 'head-prepend' }
}

export function routePreload(): Plugin {
  return {
    name: 'route-preload',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, { bundle }) {
        if (!bundle) return

        const entries = chunksOf(bundle)
          .filter((chunk) => chunk.isEntry)
          .map((chunk) => chunk.fileName)
        const preloadedByVite = staticClosure(bundle, entries)
        const common = staticClosure(bundle, chunksWithModules(bundle, COMMON_MODULES))
        const commonFiles = [...common].filter((file) => !preloadedByVite.has(file))

        const sets = ROUTE_GROUPS.map((group) => {
          const closure = staticClosure(bundle, chunksWithModules(bundle, group.modules))
          const files = [...closure].filter(
            (file) => !preloadedByVite.has(file) && !common.has(file),
          )
          return { test: group.test, files }
        })

        return [...commonFiles.map(modulepreload), routeScript(sets)]
      },
    },
  }
}
