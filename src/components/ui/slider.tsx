import { Slider as SliderPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export function Slider({
  className,
  value,
  defaultValue,
  ...props
}: ComponentProps<typeof SliderPrimitive.Root>) {
  const thumbs = value ?? defaultValue ?? [0]

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      value={value}
      defaultValue={defaultValue}
      className={cn(
        'relative flex h-4 w-full touch-none items-center select-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="bg-primary relative h-[3px] w-full grow overflow-visible rounded-full"
      />
      {thumbs.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          data-slot="slider-thumb"
          className="bg-primary ring-background focus-visible:outline-ring block size-4 shrink-0 rounded-full ring-4 outline-offset-4 transition-transform hover:scale-110 focus-visible:outline-2"
        />
      ))}
    </SliderPrimitive.Root>
  )
}
