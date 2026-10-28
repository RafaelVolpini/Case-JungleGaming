import { cn } from '@/lib/utils'

type FilterOptionProps = {
  label: string
  count: number
  selected: boolean
  onToggle: () => void
}

export function FilterOption({ label, count, selected, onToggle }: FilterOptionProps) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={selected}
        onClick={onToggle}
        className={cn(
          'focus-visible:ring-ring flex h-10 w-full items-center justify-between rounded-md px-3 text-[15px] transition-colors outline-none focus-visible:ring-2',
          selected ? 'text-primary-light' : 'text-foreground hover:text-primary-light',
        )}
      >
        <span>{label}</span>
        <span className="font-bold">({count})</span>
      </button>
    </li>
  )
}
