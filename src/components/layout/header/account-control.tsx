import { Link, useRouterState } from '@tanstack/react-router'
import { LogIn } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from '@/features/auth/hooks/use-session'

import { UserMenu } from './user-menu'

export function AccountControl() {
  const { user, isLoading } = useSession()
  const href = useRouterState({ select: (state) => state.location.href })

  if (user) return <UserMenu user={user} />
  if (isLoading) return <Skeleton className="ml-2.5 h-[35px] w-[100px] rounded-md" />

  return (
    <Link
      to="/entrar"
      search={{ redirect: href }}
      className="bg-primary text-primary-foreground hover:bg-primary-hover ml-2.5 flex h-[35px] w-[100px] items-center justify-center gap-1.5 rounded-md text-sm font-bold transition-colors"
    >
      <LogIn className="size-[14px]" strokeWidth={2.4} aria-hidden="true" />
      Entrar
    </Link>
  )
}
