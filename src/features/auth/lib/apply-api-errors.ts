import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

import { ApiRequestError, errorMessage } from '@/lib/http/errors'

export function applyApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): string | null {
  if (!(error instanceof ApiRequestError)) return errorMessage(error)
  const entries = Object.entries(error.fields)
  for (const [field, message] of entries) {
    setError(field as Path<T>, { type: 'server', message })
  }
  return entries.length > 0 ? null : error.message
}
