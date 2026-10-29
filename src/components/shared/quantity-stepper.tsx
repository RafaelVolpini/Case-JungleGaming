import { cn } from '@/lib/utils'

import { StepperButton, type StepperSize } from './stepper-button'

type QuantityStepperProps = {
  value: number
  min?: number
  max: number
  onChange: (value: number) => void
  disabled?: boolean
  size?: StepperSize
  label?: string
  className?: string
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
  return (
    <div role="group" aria-label={label} className={cn('flex items-center gap-[11px]', className)}>
      <StepperButton
        direction="decrease"
        size={size}
        disabled={disabled}
        atLimit={value <= min}
        limitHint={`Quantidade mínima: ${min}`}
        onClick={() => value > min && onChange(value - 1)}
      />
      <output
        aria-live="polite"
        className={cn(
          'text-cream min-w-4 text-center text-base',
          size === 'round' && 'relative top-1.5',
        )}
      >
        {value}
      </output>
      <StepperButton
        direction="increase"
        size={size}
        disabled={disabled}
        atLimit={value >= max}
        limitHint={`Quantidade máxima: ${max}`}
        onClick={() => value < max && onChange(value + 1)}
      />
    </div>
  )
}
