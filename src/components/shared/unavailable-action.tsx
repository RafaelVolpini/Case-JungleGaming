import type { ComponentProps } from 'react'
import { toast } from '@/lib/toast'

type UnavailableActionProps = Omit<ComponentProps<'button'>, 'onClick' | 'type'> & {
  subject?: string
}

export function UnavailableAction({ subject, children, ...props }: UnavailableActionProps) {
  const label = subject ?? 'Esta página'
  return (
    <button
      type="button"
      onClick={() => toast.info(`${label} não está disponível nesta versão.`)}
      {...props}
    >
      {children}
    </button>
  )
}
