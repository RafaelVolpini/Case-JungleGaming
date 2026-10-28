import type { ReactNode } from 'react'

import { BackButton } from '@/components/shared/back-button'
import { useIsDesktop } from '@/lib/use-media-query'

import { ProfileMobileNav } from './profile-mobile-nav'
import { ProfileSidebar } from './profile-sidebar'

export function ProfileLayout({ children }: { children: ReactNode }) {
  const isDesktop = useIsDesktop()

  if (!isDesktop) {
    return (
      <div className="px-6 pt-8 pb-8">
        <header className="flex h-[35px] items-center gap-6 pl-1">
          <BackButton />
          <h2 className="text-cream text-xl leading-7 font-bold">Meu perfil</h2>
        </header>
        <ProfileMobileNav />
        <div className="mt-6">{children}</div>
      </div>
    )
  }

  return (
    <div className="page-container grid gap-y-8 pt-8 pb-16 md:grid-cols-[310px_minmax(0,1fr)] md:items-start md:gap-x-7">
      <ProfileSidebar />
      <div>{children}</div>
    </div>
  )
}
