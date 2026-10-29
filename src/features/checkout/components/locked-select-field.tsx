import { controlAria, Field } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type LockedSelectFieldProps<T extends string> = {
  label: string
  placeholder: string
  value: T
  options: readonly T[]
  labels: Record<T, string>
}

export function LockedSelectField<T extends string>({
  label,
  placeholder,
  value,
  options,
  labels,
}: LockedSelectFieldProps<T>) {
  return (
    <Field label={label} required>
      {(field) => (
        <Select value={value} disabled>
          <SelectTrigger id={field.id} {...controlAria(field)} className="disabled:opacity-100">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {labels[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </Field>
  )
}
