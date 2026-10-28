import { XIcon } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { useRef, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

type ModalShellProps = {
  title: string
  onClose: () => void
  overlayClassName?: string
  cardClassName?: string
  closeClassName?: string
  focusFirstInput?: boolean
  children: ReactNode
}

export function ModalShell({
  title,
  onClose,
  overlayClassName,
  cardClassName,
  closeClassName,
  focusFirstInput = false,
  children,
}: ModalShellProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <DialogPrimitive.Root open onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          data-modal-overlay=""
          className={cn('bg-background fixed inset-0 z-50 overflow-y-auto', overlayClassName)}
        >
          <div className="flex min-h-full md:items-center md:justify-center md:p-6">
            <DialogPrimitive.Content
              ref={contentRef}
              aria-describedby={undefined}
              onOpenAutoFocus={(event) => {
                if (!focusFirstInput) return
                event.preventDefault()
                contentRef.current?.querySelector('input')?.focus()
              }}
              className={cn('bg-card relative flex w-full flex-col outline-none', cardClassName)}
            >
              <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
              <DialogPrimitive.Close
                className={cn(
                  'text-primary focus-visible:ring-ring absolute top-3 right-3 grid size-6 place-items-center rounded-sm outline-none focus-visible:ring-2',
                  closeClassName,
                )}
              >
                <XIcon className="size-6" strokeWidth={1.25} />
                <span className="sr-only">Fechar</span>
              </DialogPrimitive.Close>
              {children}
              <div className="bg-primary mt-auto h-2.5 shrink-0" />
            </DialogPrimitive.Content>
          </div>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
