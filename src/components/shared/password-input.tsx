import { Eye, EyeOff } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

import { Input } from '@/components/ui/input'

type PasswordInputProps = Omit<ComponentProps<typeof Input>, 'type'> & {
  visible: boolean
  onToggleVisible?: () => void
  mobileOnlyToggle?: boolean
}

export function PasswordInput({
  visible,
  onToggleVisible,
  mobileOnlyToggle,
  ...props
}: PasswordInputProps) {
  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        className="h-[50px] rounded-xl px-4 pr-11 md:h-10 md:rounded"
      />
      {onToggleVisible && (
        <button
          type="button"
          onClick={onToggleVisible}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visible}
          className={cn(
            'text-[#55321f] md:text-placeholder focus-visible:ring-ring absolute top-1/2 right-[11px] grid size-6 -translate-y-1/2 place-items-center rounded-sm outline-none focus-visible:ring-2',
            mobileOnlyToggle && 'md:hidden',
          )}
        >
          {visible ? (
            <Eye className="size-5" aria-hidden="true" />
          ) : (
            <EyeOff className="size-5" aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  )
}
