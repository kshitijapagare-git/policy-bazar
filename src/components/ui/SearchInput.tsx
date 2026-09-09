import { Icon } from './Icon'
import { Input } from './Input'
import { cn } from '@/lib/cn'

export interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  className?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  label = 'Search',
  className,
}: SearchInputProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label className="sr-only" htmlFor="search-input">
        {label}
      </label>
      <div className="relative">
        <Icon
          name="search"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
        <Input
          id="search-input"
          type="search"
          role="searchbox"
          className="pl-9"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  )
}
