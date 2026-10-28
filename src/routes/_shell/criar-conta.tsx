import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { AuthPage } from '@/features/auth/pages/auth-page'
import { HomePage } from '@/features/catalog/pages/home-page'

const authSearchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/_shell/criar-conta')({
  validateSearch: authSearchSchema,
  component: RegisterRoute,
})

function RegisterRoute() {
  const { redirect } = Route.useSearch()

  return (
    <>
      <HomePage />
      <AuthPage mode="register" redirect={redirect} />
    </>
  )
}
