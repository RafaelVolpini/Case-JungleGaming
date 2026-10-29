import type { ExternalToast } from 'sonner'

import { requestToaster } from './toaster-gate'

type ToastKind = 'info' | 'success' | 'error' | 'warning'

async function show(kind: ToastKind, message: string, data?: ExternalToast): Promise<void> {
  await requestToaster()
  const { toast: sonner } = await import('sonner')
  sonner[kind](message, data)
}

export const toast = {
  info: (message: string, data?: ExternalToast) => void show('info', message, data),
  success: (message: string, data?: ExternalToast) => void show('success', message, data),
  error: (message: string, data?: ExternalToast) => void show('error', message, data),
  warning: (message: string, data?: ExternalToast) => void show('warning', message, data),
}
