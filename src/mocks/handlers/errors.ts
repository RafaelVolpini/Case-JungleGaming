import { HttpResponse } from 'msw'

import type { ApiErrorCode } from '@/contracts/common'

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 422,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  COUPON_INVALID: 422,
  COUPON_EXPIRED: 422,
  QUOTE_STALE: 409,
  SERVER_ERROR: 500,
}

export function errorResponse(
  code: ApiErrorCode,
  message: string,
  fields?: Record<string, string>,
) {
  return HttpResponse.json(
    { error: { code, message, ...(fields ? { fields } : {}) } },
    { status: STATUS_BY_CODE[code] },
  )
}

export function fieldErrors(
  issues: Array<{ path: PropertyKey[]; message: string }>,
): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const issue of issues) {
    const key = issue.path.map(String).join('.') || '_'
    fields[key] ??= issue.message
  }
  return fields
}

export function validationError(
  message: string,
  issues: Array<{ path: PropertyKey[]; message: string }>,
) {
  return errorResponse('VALIDATION_ERROR', message, fieldErrors(issues))
}
