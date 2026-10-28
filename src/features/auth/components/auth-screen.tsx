import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { AuthSwitchPrompt } from './auth-switch-prompt'

type AuthScreenProps = {
  mode: 'login' | 'register'
  redirect?: string
  expired?: boolean
  children: ReactNode
}

const TITLES = { login: 'Entrar', register: 'Criar perfil de colecionador' } as const

export function AuthScreen({ mode, redirect, expired, children }: AuthScreenProps) {
  return (
    <div className="bg-background mx-auto min-h-dvh max-w-[460px] px-7 pt-[130px] pb-10">
      <Link
        to="/"
        aria-label="Kurio, página inicial"
        className="text-cream focus-visible:ring-ring block rounded-sm text-center text-[32px] leading-9 font-bold tracking-[0.1em] outline-none focus-visible:ring-2"
      >
        KURIO
      </Link>
      <h1
        className={cn(
          'text-cream mt-[85px] text-center leading-7 font-bold',
          mode === 'login' ? 'text-xl' : 'text-lg',
        )}
      >
        {TITLES[mode]}
      </h1>
      {expired && mode === 'login' && (
        <p role="status" className="text-primary-light mt-3 text-center text-sm">
          Sua sessão expirou. Entre novamente para continuar.
        </p>
      )}
      <div className="mt-[33px]">{children}</div>
      <AuthSwitchPrompt mode={mode} redirect={redirect} className="mt-[38.5px]" />
    </div>
  )
}
