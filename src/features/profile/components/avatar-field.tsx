import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { AVATAR_EMOJIS, DEFAULT_AVATAR } from '../lib/avatars'

type AvatarFieldProps = { value: string; onChange: (emoji: string) => void }

export function AvatarField({ value, onChange }: AvatarFieldProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="-mt-[6px]">
      <p id="avatar-label" className="text-cream text-[15px] leading-6">
        Avatar
      </p>
      <div className="mt-[6px] flex items-center">
        <span
          role="img"
          aria-label="Avatar atual"
          className="bg-surface-raised grid size-[50px] place-items-center rounded-full text-2xl"
        >
          {value}
        </span>
        <Button
          type="button"
          aria-expanded={open}
          aria-controls="avatar-options"
          onClick={() => setOpen((current) => !current)}
          className="ml-6 h-10 w-[98px] rounded text-sm"
        >
          Alterar
        </Button>
        <button
          type="button"
          onClick={() => onChange(DEFAULT_AVATAR)}
          className="text-cream focus-visible:ring-ring ml-5 rounded-sm text-sm outline-none hover:underline focus-visible:ring-2"
        >
          Remover
        </button>
      </div>
      {open && (
        <div
          id="avatar-options"
          role="radiogroup"
          aria-labelledby="avatar-label"
          className="mt-3 grid grid-cols-6 gap-2"
        >
          {AVATAR_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              role="radio"
              aria-checked={emoji === value}
              aria-label={`Avatar ${emoji}`}
              onClick={() => onChange(emoji)}
              className={cn(
                'bg-surface-raised focus-visible:ring-ring grid size-11 place-items-center rounded-full border text-2xl outline-none focus-visible:ring-2',
                emoji === value ? 'border-primary' : 'border-input hover:border-primary/60',
              )}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
