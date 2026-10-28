import type { ReactNode } from 'react'

import { ModalShell } from '@/components/shared/modal-shell'

type OrderModalProps = {
  title: string
  onClose: () => void
  children: ReactNode
}

export function OrderModal({ title, onClose, children }: OrderModalProps) {
  return (
    <ModalShell title={title} onClose={onClose} cardClassName="md:w-[578px]">
      <div className="mx-auto flex w-full max-w-[578px] flex-1 flex-col">{children}</div>
    </ModalShell>
  )
}
