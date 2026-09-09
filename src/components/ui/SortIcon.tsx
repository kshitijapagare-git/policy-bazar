import { cn } from '@/lib/cn'
import type { SortDirection } from '@/types'

export interface SortIconProps {
  direction?: SortDirection | null
}

/** Both chevrons render at all times; the active one loses its dimming. */
export function SortIcon({ direction = null }: SortIconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12" className="ml-1 inline-block h-3 w-3 shrink-0">
      <path
        d="M6 1.5 9 5H3l3-3.5Z"
        fill="currentColor"
        className={cn(direction === 'asc' ? 'opacity-100' : 'opacity-30')}
      />
      <path
        d="M6 10.5 3 7h6l-3 3.5Z"
        fill="currentColor"
        className={cn(direction === 'desc' ? 'opacity-100' : 'opacity-30')}
      />
    </svg>
  )
}
