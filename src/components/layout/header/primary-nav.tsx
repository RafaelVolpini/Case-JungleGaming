import { Link, useRouterState } from '@tanstack/react-router'

import { UnavailableAction } from '@/components/shared/unavailable-action'
import { cn } from '@/lib/utils'

const itemClassName = 'relative flex h-[45px] items-start text-base leading-6 transition-colors'
const activeClassName =
  'text-primary-light font-bold after:bg-primary after:absolute after:inset-x-0 after:bottom-0 after:h-[3px]'
const idleClassName = 'text-cream hover:text-primary-light'

export function PrimaryNav() {
  const { pathname, hash } = useRouterState({
    select: (state) => ({ pathname: state.location.pathname, hash: state.location.hash }),
  })
  const onHome = pathname === '/' && hash !== 'catalogo'

  return (
    <nav aria-label="Principal" className="flex items-start gap-10">
      <Link
        to="/"
        aria-current={onHome ? 'page' : undefined}
        className={cn(itemClassName, onHome ? activeClassName : idleClassName)}
      >
        Início
      </Link>
      <Link
        to="/"
        hash="catalogo"
        aria-current={onHome ? undefined : 'page'}
        className={cn(itemClassName, onHome ? idleClassName : activeClassName)}
      >
        Mercado
      </Link>
      <UnavailableAction subject="Criadores" className={cn(itemClassName, idleClassName)}>
        Criadores
      </UnavailableAction>
      <UnavailableAction subject="Aprenda" className={cn(itemClassName, idleClassName)}>
        Aprenda
      </UnavailableAction>
    </nav>
  )
}
