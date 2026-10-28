import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ENS_SUFFIXES, joinEnsName, splitEnsName } from '@/lib/ens'

type EnsNameFieldProps = {
  id: string
  value: string | null
  onChange: (value: string | null) => void
  invalid?: boolean
  describedBy?: string
}

export function EnsNameField({ id, value, onChange, invalid, describedBy }: EnsNameFieldProps) {
  const { name, suffix } = splitEnsName(value)

  return (
    <div className="flex gap-2.5">
      <Select value={suffix} onValueChange={(next) => onChange(joinEnsName(name, next))}>
        <SelectTrigger aria-label="Domínio ENS" className="w-[78px] shrink-0 px-2.5">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ENS_SUFFIXES.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id={id}
        value={name}
        onChange={(event) => onChange(joinEnsName(event.target.value, suffix))}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        autoComplete="off"
        className="px-4"
      />
    </div>
  )
}
