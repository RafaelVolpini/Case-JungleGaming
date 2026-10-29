import { Minus, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'

export type StepperSize = 'lg' | 'compact' | 'round'

const buttonSize: Record<StepperSize, string> = {
  lg: 'h-12 w-[31px]',
  compact: 'h-[29px] w-[19px]',
  round: 'size-6',
}

const enabledLook: Record<StepperSize, string> = {
  lg: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  compact: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  round: 'bg-surface-raised text-cream hover:text-primary-light',
}

const limitLook =
  'bg-surface-raised text-muted-foreground ring-muted-foreground/60 cursor-not-allowed ring-1 ring-inset'

type StepperButtonProps = {
  direction: 'decrease' | 'increase'
  size: StepperSize
  atLimit: boolean
  disabled: boolean
  limitHint: string
  onClick: () => void
}

export function StepperButton({
  direction,
  size,
  atLimit,
  disabled,
  limitHint,
  onClick,
}: StepperButtonProps) {
  const Icon = direction === 'decrease' ? Minus : Plus

  return (
    <button
      type="button"
      aria-label={direction === 'decrease' ? 'Diminuir quantidade' : 'Aumentar quantidade'}
      title={atLimit ? limitHint : undefined}
      disabled={disabled}
      aria-disabled={atLimit}
      onClick={onClick}
      className={cn(
        atLimit ? limitLook : enabledLook[size],
        'grid shrink-0 place-items-center rounded-full transition-colors outline-none',
        'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-40',
        buttonSize[size],
      )}
    >
      <Icon className={size === 'lg' ? 'size-5' : 'size-3'} strokeWidth={3} />
    </button>
  )
}
