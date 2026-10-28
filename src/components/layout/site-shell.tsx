import type { ReactNode } from 'react'

import { MobileTabBar } from './mobile-tab-bar'
import { SiteFooter } from './footer/site-footer'
import { SiteHeader } from './header/site-header'

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#conteudo"
        className="bg-primary text-primary-foreground sr-only z-50 rounded-md px-4 py-2 font-bold focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <main id="conteudo" className="flex-1 pb-28 outline-none md:pb-0" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
      <MobileTabBar />
    </div>
  )
}
