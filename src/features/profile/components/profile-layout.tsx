import type { ReactNode } from 'react'

import { ProfileSidebar } from './profile-sidebar'

export function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="page-container grid gap-y-8 pt-8 pb-16 md:grid-cols-[310px_minmax(0,1fr)] md:items-start md:gap-x-7">
      <ProfileSidebar />
      <div>{children}</div>
    </div>
  )
}
