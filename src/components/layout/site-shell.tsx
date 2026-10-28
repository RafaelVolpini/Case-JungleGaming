import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { MobileTabBar } from './mobile-tab-bar'
import { SiteFooter } from './footer/site-footer'
import { SiteHeader } from './header/site-header'
import { useTabBarVisible } from './use-tab-bar-visible'

export function SiteShell({ children }: { children: ReactNode }) {
  const tabBarVisible = useTabBarVisible()

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#conteudo"
        className="bg-primary text-primary-foreground sr-only z-50 rounded-md px-4 py-2 font-bold focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <main
        id="conteudo"
        className={cn('flex-1 outline-none md:pb-0', tabBarVisible && 'pb-28')}
        tabIndex={-1}
      >
        {children}
      </main>
      <SiteFooter />
      <MobileTabBar />
    </div>
  )
}
