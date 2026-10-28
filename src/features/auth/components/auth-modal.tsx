import { XIcon } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { useRef, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

type AuthModalProps = {
  title: string
  onClose: () => void
  className?: string
  children: ReactNode
}

export function AuthModal({ title, onClose, className, children }: AuthModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <DialogPrimitive.Root open onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="bg-background fixed inset-0 z-50 md:bg-transparent" />
        <DialogPrimitive.Content
          ref={contentRef}
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            contentRef.current?.querySelector('input')?.focus()
          }}
          className={cn(
            'bg-card fixed inset-0 z-50 flex flex-col overflow-y-auto outline-none',
            'md:inset-auto md:top-[159px] md:left-1/2 md:max-h-[calc(100dvh-159px)] md:w-[500px] md:-translate-x-1/2',
            className,
          )}
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Close className="text-primary focus-visible:ring-ring absolute top-2 right-[9px] grid size-6 place-items-center rounded-sm outline-none focus-visible:ring-2">
            <XIcon className="size-6" strokeWidth={1.25} />
            <span className="sr-only">Fechar</span>
          </DialogPrimitive.Close>
          {children}
          <div className="bg-primary mt-auto h-2.5 shrink-0" />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
