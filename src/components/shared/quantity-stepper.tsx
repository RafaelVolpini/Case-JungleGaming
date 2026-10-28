import { Minus, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'

type QuantityStepperProps = {
  value: number
  min?: number
  max: number
  onChange: (value: number) => void
  disabled?: boolean
  size?: 'lg' | 'sm'
  label?: string
  className?: string
}

const buttonSize = {
  lg: 'h-12 w-[31px]',
  sm: 'size-7',
}

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  disabled = false,
  size = 'lg',
  label = 'Quantidade',
  className,
}: QuantityStepperProps) {
  const buttonClassName = cn(
    'bg-primary text-primary-foreground hover:bg-primary-hover grid shrink-0 place-items-center rounded-full transition-colors outline-none',
    'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-40 aria-disabled:cursor-not-allowed',
    buttonSize[size],
  )

  return (
    <div role="group" aria-label={label} className={cn('flex items-center gap-[11px]', className)}>
      <button
        type="button"
        aria-label="Diminuir quantidade"
        disabled={disabled}
        aria-disabled={value <= min}
        onClick={() => value > min && onChange(value - 1)}
        className={buttonClassName}
      >
        <Minus className={size === 'lg' ? 'size-5' : 'size-4'} strokeWidth={3} />
      </button>
      <output
        aria-live="polite"
        className={cn(
          'text-cream min-w-4 text-center',
          size === 'lg' ? 'text-base' : 'text-base font-bold',
        )}
      >
        {value}
      </output>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        disabled={disabled}
        aria-disabled={value >= max}
        onClick={() => value < max && onChange(value + 1)}
        className={buttonClassName}
      >
        <Plus className={size === 'lg' ? 'size-5' : 'size-4'} strokeWidth={3} />
      </button>
    </div>
  )
}
