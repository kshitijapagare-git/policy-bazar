import type { ReactNode } from 'react'
import { Button } from './Button'
import { Select } from './Select'
import type { SelectOption } from '@/types'

export interface FilterDef {
  key: string
  label: string
  options: SelectOption[]
  placeholder?: string
}

export interface TableFiltersProps {
  filters: FilterDef[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  onReset?: () => void
  children?: ReactNode
}

export function TableFilters({ filters, values, onChange, onReset, children }: TableFiltersProps) {
  const activeCount = filters.filter((filter) => values[filter.key]).length

  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 lg:flex-row lg:items-end lg:gap-4">
      {children}

      <div className="flex flex-wrap items-end gap-3">
        {filters.map((filter) => (
          <div key={filter.key} className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-none">
            <label htmlFor={`filter-${filter.key}`} className="text-xs font-medium text-slate-600">
              {filter.label}
            </label>
            <Select
              id={`filter-${filter.key}`}
              className="py-1.5 text-xs sm:w-40"
              value={values[filter.key] ?? ''}
              placeholder={filter.placeholder ?? `All ${filter.label.toLowerCase()}`}
              options={filter.options}
              onChange={(event) => onChange(filter.key, event.target.value)}
            />
          </div>
        ))}

        {onReset && activeCount > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onReset}
            aria-label="Clear filters"
            className="mb-0.5"
          >
            Clear{' '}
            <span className="ml-0.5 rounded-full bg-slate-200 px-1.5 text-[0.6875rem] font-semibold text-slate-700">
              {activeCount}
            </span>
          </Button>
        )}
      </div>
    </div>
  )
}
