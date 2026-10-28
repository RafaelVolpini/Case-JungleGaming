import { XIcon } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import type { ReactNode } from 'react'

type OrderModalProps = {
  title: string
  onClose: () => void
  children: ReactNode
}

export function OrderModal({ title, onClose, children }: OrderModalProps) {
  return (
    <DialogPrimitive.Root open onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="bg-background fixed inset-0 z-50" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="bg-card fixed inset-0 z-50 flex flex-col overflow-y-auto outline-none md:inset-auto md:top-1/2 md:left-1/2 md:max-h-dvh md:w-[578px] md:-translate-x-1/2 md:-translate-y-1/2"
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Close className="text-primary focus-visible:ring-ring absolute top-3 right-3 grid size-6 place-items-center rounded-sm outline-none focus-visible:ring-2">
            <XIcon className="size-6" strokeWidth={1.25} />
            <span className="sr-only">Fechar</span>
          </DialogPrimitive.Close>
          <div className="mx-auto flex w-full max-w-[578px] flex-1 flex-col">
            {children}
            <div className="bg-primary mt-auto h-2.5 shrink-0" />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
