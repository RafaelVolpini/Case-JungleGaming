import type { ReactNode } from 'react'

import { ModalShell } from '@/components/shared/modal-shell'
import { cn } from '@/lib/utils'

type AuthModalProps = {
  title: string
  onClose: () => void
  className?: string
  children: ReactNode
}

export function AuthModal({ title, onClose, className, children }: AuthModalProps) {
  return (
    <ModalShell
      title={title}
      onClose={onClose}
      overlayClassName="md:bg-transparent"
      cardClassName={cn('md:w-[500px]', className)}
      closeClassName="top-2 right-[9px]"
      focusFirstInput
    >
      {children}
    </ModalShell>
  )
}
