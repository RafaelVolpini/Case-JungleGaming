import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'

import type { Edition } from '@/contracts/nft'
import { cn } from '@/lib/utils'

type EditionPickerProps = {
  editions: Edition[]
  value: string
  onChange: (editionId: string) => void
  itemClassName?: string
}

export function EditionPicker({ editions, value, onChange, itemClassName }: EditionPickerProps) {
  return (
    <RadioGroupPrimitive.Root
      aria-label="Edição"
      value={value}
      onValueChange={onChange}
      className="flex flex-wrap gap-2"
    >
      {editions.map((edition) => {
        const soldOut = edition.available === 0
        return (
          <RadioGroupPrimitive.Item
            key={edition.id}
            value={edition.id}
            disabled={soldOut}
            aria-label={soldOut ? `Edição ${edition.label}, esgotada` : `Edição ${edition.label}`}
            className={cn(
              'text-cream h-7 rounded-full border border-[#3a2210] px-1.5 text-[13px] transition-colors outline-none',
              'focus-visible:ring-ring focus-visible:ring-2 data-[state=checked]:border-primary data-[state=checked]:text-primary-light data-[state=checked]:border-[1.5px]',
              'hover:border-primary/60 disabled:cursor-not-allowed disabled:line-through disabled:opacity-40',
              itemClassName,
            )}
          >
            {edition.label}
          </RadioGroupPrimitive.Item>
        )
      })}
    </RadioGroupPrimitive.Root>
  )
}
