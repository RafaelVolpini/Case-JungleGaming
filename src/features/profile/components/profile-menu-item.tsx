import { Link } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

import { UnavailableAction } from '@/components/shared/unavailable-action'
import { cn } from '@/lib/utils'

const ROW =
  'text-primary-light focus-visible:ring-ring relative flex h-[45px] w-full items-center gap-3 pl-[17px] text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-inset'

type ItemProps = { icon: LucideIcon; label: string }

function Content({ icon: Icon, label }: ItemProps) {
  return (
    <>
      <Icon className="size-[18px] shrink-0" strokeWidth={1.5} aria-hidden="true" />
      {label}
    </>
  )
}

export function ProfileLink({ to, ...item }: ItemProps & Pick<ComponentProps<typeof Link>, 'to'>) {
  return (
    <Link
      to={to}
      className={ROW}
      activeProps={{ 'aria-current': 'page' }}
      activeOptions={{ exact: true }}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span aria-hidden="true" className="bg-primary absolute inset-y-0 left-0 w-1.5" />
          )}
          <Content {...item} />
        </>
      )}
    </Link>
  )
}

export function ProfileUnavailable(item: ItemProps) {
  return (
    <UnavailableAction subject={item.label} aria-disabled="true" className={cn(ROW, 'text-left')}>
      <Content {...item} />
    </UnavailableAction>
  )
}
