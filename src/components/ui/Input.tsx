import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export function Input({ invalid = false, className, ...rest }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        'block w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm',
        'ring-1 ring-inset placeholder:text-slate-400',
        'focus:ring-2 focus:ring-inset focus:ring-sky-600',
        'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
        invalid ? 'ring-rose-400' : 'ring-slate-300',
        className,
      )}
      {...rest}
    />
  )
}
