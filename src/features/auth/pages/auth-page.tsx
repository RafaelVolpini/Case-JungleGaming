import { useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

import { sanitizeRedirect } from '@/lib/url/safe-redirect'
import { useIsDesktop } from '@/lib/use-media-query'
import { cn } from '@/lib/utils'

import { AuthIntro } from '../components/auth-intro'
import { AuthModal } from '../components/auth-modal'
import { AuthScreen } from '../components/auth-screen'
import { AuthTabs } from '../components/auth-tabs'
import { LoginForm } from '../components/login-form'
import { RegisterForm } from '../components/register-form'
import { useSession } from '../hooks/use-session'

type AuthPageProps = {
  mode: 'login' | 'register'
  redirect?: string
  expired?: boolean
}

const COPY = {
  login: {
    title: 'Entrar',
    intro: 'Entre para gerenciar sua carteira, coleção e perfil de criador.',
    height: 'md:top-[160px] md:h-[600px]',
  },
  register: {
    title: 'Criar conta',
    intro: 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.',
    height: 'md:top-[158px] md:h-[656px]',
  },
}

export function AuthPage({ mode, redirect, expired = false }: AuthPageProps) {
  const router = useRouter()
  const isDesktop = useIsDesktop()
  const { isAuthenticated } = useSession()
  const target = sanitizeRedirect(redirect)
  const copy = COPY[mode]
  const form = mode === 'login' ? <LoginForm /> : <RegisterForm />

  useEffect(() => {
    if (isAuthenticated) router.history.replace(target)
  }, [isAuthenticated, target, router])

  if (!isDesktop) {
    return (
      <AuthScreen mode={mode} redirect={redirect} expired={expired}>
        {form}
      </AuthScreen>
    )
  }

  return (
    <AuthModal
      title="Acesso à conta"
      onClose={() => router.history.replace('/')}
      className={cn(copy.height)}
    >
      <AuthTabs mode={mode} redirect={redirect} />
      <AuthIntro>{copy.intro}</AuthIntro>
      {expired && mode === 'login' && (
        <p role="status" className="text-primary-light mt-3 text-center text-sm">
          Sua sessão expirou. Entre novamente para continuar.
        </p>
      )}
      <div className="mx-auto mt-[24.5px] w-full max-w-[340px] px-4 md:px-0">{form}</div>
    </AuthModal>
  )
}
