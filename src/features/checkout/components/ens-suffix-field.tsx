import { Controller, type Control } from 'react-hook-form'

import { controlAria, Field } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CollectorDetails } from '@/contracts/order'
import { ENS_SUFFIXES } from '@/lib/ens'

type EnsSuffixFieldProps = {
  control: Control<CollectorDetails>
  error?: string
}

export function EnsSuffixField({ control, error }: EnsSuffixFieldProps) {
  return (
    <Field label="Nome ENS" required error={error}>
      {(field) => (
        <Controller
          control={control}
          name="ensSuffix"
          render={({ field: { value, onChange } }) => (
            <Select value={value} onValueChange={onChange}>
              <SelectTrigger id={field.id} {...controlAria(field)} className="w-[77px] px-2.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENS_SUFFIXES.map((suffix) => (
                  <SelectItem key={suffix} value={suffix}>
                    {suffix}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      )}
    </Field>
  )
}
