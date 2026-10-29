import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { sessionQueryOptions } from '@/features/auth/api/session-query'
import { readToken } from '@/lib/auth/token'
import { ApiRequestError } from '@/lib/http/errors'

export const Route = createFileRoute('/_shell/_authed')({
  beforeLoad: async ({ context, location }) => {
    if (!readToken()) {
      throw redirect({ to: '/entrar', search: { redirect: location.href } })
    }
    try {
      await context.queryClient.fetchQuery(sessionQueryOptions())
    } catch (error) {
      if (error instanceof ApiRequestError && error.code === 'UNAUTHENTICATED') {
        throw redirect({ to: '/entrar', search: { redirect: location.href, expired: '1' } })
      }
      throw error
    }
  },
  component: Outlet,
})
