import { Input } from './Input'

export interface DatePickerProps {
  id: string
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
  invalid?: boolean
  disabled?: boolean
}

/** Thin wrapper over the native date input so date fields stay consistent. */
export function DatePicker({ id, value, onChange, min, max, invalid, disabled }: DatePickerProps) {
  return (
    <Input
      id={id}
      type="date"
      value={value}
      min={min}
      max={max}
      invalid={invalid}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
