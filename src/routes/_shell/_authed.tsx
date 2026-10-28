import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { sessionQueryOptions } from '@/features/auth/api/session-query'
import { readToken } from '@/lib/auth/token'

export const Route = createFileRoute('/_shell/_authed')({
  beforeLoad: async ({ context, location }) => {
    if (!readToken()) {
      throw redirect({ to: '/entrar', search: { redirect: location.href } })
    }
    try {
      await context.queryClient.fetchQuery(sessionQueryOptions())
    } catch {
      throw redirect({ to: '/entrar', search: { redirect: location.href, expired: '1' } })
    }
  },
  component: Outlet,
})
