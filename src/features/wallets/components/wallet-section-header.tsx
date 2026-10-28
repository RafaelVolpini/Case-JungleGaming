import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type WalletSectionHeaderProps = {
  id: string
  title: string
  description: string
  descriptionClassName?: string
  actions?: ReactNode
}

export function WalletSectionHeader({
  id,
  title,
  description,
  descriptionClassName,
  actions,
}: WalletSectionHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <h2 id={id} className="text-cream text-base leading-6 font-bold">
          {title}
        </h2>
        <p className={cn('text-foreground mt-0.5 text-sm leading-5', descriptionClassName)}>
          {description}
        </p>
      </div>
      {actions && <div className="flex h-6 items-center gap-[9px]">{actions}</div>}
    </header>
  )
}
