import { Link } from '@tanstack/react-router'

import { cn } from '@/lib/utils'

type AuthTabsProps = { mode: 'login' | 'register'; redirect?: string }

const TAB = 'text-xl leading-7 font-bold'

export function AuthTabs({ mode, redirect }: AuthTabsProps) {
  const search = redirect ? { redirect } : {}

  return (
    <nav aria-label="Acesso à conta" className="flex items-center justify-center gap-[9.5px] pt-11">
      <Link
        to="/entrar"
        search={search}
        aria-current={mode === 'login' ? 'page' : undefined}
        className={cn(TAB, mode === 'login' ? 'text-primary-light' : 'text-cream')}
      >
        Entrar
      </Link>
      <span aria-hidden="true" className="bg-asterisk h-5 w-px" />
      <Link
        to="/criar-conta"
        search={search}
        aria-current={mode === 'register' ? 'page' : undefined}
        className={cn(TAB, mode === 'register' ? 'text-primary-light' : 'text-cream')}
      >
        Criar conta
      </Link>
    </nav>
  )
}
