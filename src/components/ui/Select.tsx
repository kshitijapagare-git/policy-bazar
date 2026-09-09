import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import type { SelectOption } from '@/types'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
  placeholder?: string
  invalid?: boolean
}

export function Select({ options, placeholder, invalid = false, className, ...rest }: SelectProps) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={cn(
        'block w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm',
        'ring-1 ring-inset focus:ring-2 focus:ring-inset focus:ring-sky-600',
        'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
        invalid ? 'ring-rose-400' : 'ring-slate-300',
        className,
      )}
      {...rest}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
