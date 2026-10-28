import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type AuthScreenProps = {
  mode: 'login' | 'register'
  redirect?: string
  expired?: boolean
  children: ReactNode
}

const COPY = {
  login: {
    title: 'Entrar',
    prompt: 'Novo na Kurio?',
    action: 'Crie uma conta',
    to: '/criar-conta',
  },
  register: {
    title: 'Criar perfil de colecionador',
    prompt: 'Já tem uma conta?',
    action: 'Entre',
    to: '/entrar',
  },
} as const

export function AuthScreen({ mode, redirect, expired, children }: AuthScreenProps) {
  const copy = COPY[mode]

  return (
    <div className="bg-background min-h-dvh px-7 pt-[130px] pb-10">
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
        {copy.title}
      </h1>
      {expired && mode === 'login' && (
        <p role="status" className="text-primary-light mt-3 text-center text-sm">
          Sua sessão expirou. Entre novamente para continuar.
        </p>
      )}
      <div className="mt-[33px]">{children}</div>
      <p className="text-foreground mt-[38.5px] text-center text-base leading-6">
        {copy.prompt}{' '}
        <Link
          to={copy.to}
          search={redirect ? { redirect } : {}}
          className="focus-visible:ring-ring rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2"
        >
          {copy.action}
        </Link>
      </p>
    </div>
  )
}
