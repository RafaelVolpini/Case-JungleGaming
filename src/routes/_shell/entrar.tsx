import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { AuthPage } from '@/features/auth/pages/auth-page'
import { HomePage } from '@/features/catalog/pages/home-page'
import { useIsDesktop } from '@/lib/use-media-query'

const authSearchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
  expired: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/_shell/entrar')({
  validateSearch: authSearchSchema,
  component: LoginRoute,
})

function LoginRoute() {
  const isDesktop = useIsDesktop()
  const { redirect, expired } = Route.useSearch()

  return (
    <>
      {isDesktop && <HomePage />}
      <AuthPage mode="login" redirect={redirect} expired={expired !== undefined} />
    </>
  )
}
