import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { MobileTabBar } from './mobile-tab-bar'
import { DesktopFooter, DesktopHeader } from './desktop-chrome'
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
      <DesktopHeader />
      <main
        id="conteudo"
        className={cn(
          'mx-auto w-full max-w-[640px] flex-1 outline-none xl:max-w-none xl:pb-0',
          tabBarVisible && 'pb-28',
        )}
        tabIndex={-1}
      >
        {children}
      </main>
      <DesktopFooter />
      <MobileTabBar />
    </div>
  )
}
