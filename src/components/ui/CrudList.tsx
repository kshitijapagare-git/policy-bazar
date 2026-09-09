import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { EmptyState } from './EmptyState'
import { SortIcon } from './SortIcon'
import { Spinner } from './Spinner'
import type { SortDirection } from '@/types'

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  align?: 'left' | 'right'
  /** Numeric columns get tabular figures so decimal points line up. */
  numeric?: boolean
  /** The identifying column - becomes the card title in the stacked layout. */
  primary?: boolean
  /** Hidden below `md`, for columns that are noise on a small screen. */
  hideOnMobile?: boolean
  className?: string
  render: (row: T) => ReactNode
}

export interface CrudListProps<T> {
  columns: Column<T>[]
  rows: T[]
  getRowKey: (row: T) => string | number
  loading?: boolean
  error?: string | null
  emptyTitle?: string
  emptyMessage?: string
  emptyAction?: ReactNode
  sortBy?: string
  sortDir?: SortDirection
  onSortChange?: (key: string) => void
  renderActions?: (row: T) => ReactNode
  caption?: string
}

export function CrudList<T>({
  columns,
  rows,
  getRowKey,
  loading = false,
  error = null,
  emptyTitle = 'Nothing here yet',
  emptyMessage,
  emptyAction,
  sortBy,
  sortDir,
  onSortChange,
  renderActions,
  caption,
}: CrudListProps<T>) {
  if (loading) {
    return (
      <div className="flex justify-center px-6 py-16">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" className="px-6 py-16 text-center text-sm text-rose-600">
        {error}
      </div>
    )
  }

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} action={emptyAction} />
  }

  return (
    <div className="overflow-x-auto">
      <table data-responsive="true" className="min-w-full text-sm sm:divide-y sm:divide-slate-200">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-slate-50/80">
          <tr>
            {columns.map((column) => {
              const active = sortBy === column.key
              const direction = active ? (sortDir ?? 'asc') : null

              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    active ? (direction === 'asc' ? 'ascending' : 'descending') : undefined
                  }
                  className={cn(
                    'whitespace-nowrap px-4 py-3 text-[0.6875rem] font-semibold uppercase tracking-wider text-slate-500',
                    column.align === 'right' ? 'text-right' : 'text-left',
                    column.hideOnMobile && 'hidden md:table-cell',
                    column.className,
                  )}
                >
                  {column.sortable && onSortChange ? (
                    <button
                      type="button"
                      onClick={() => onSortChange(column.key)}
                      className={cn(
                        'inline-flex items-center rounded uppercase transition-colors hover:text-slate-900',
                        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600',
                        active && 'text-slate-900',
                      )}
                    >
                      {column.header}
                      <SortIcon direction={direction} />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              )
            })}
            {renderActions && (
              <th scope="col" className="px-4 py-3 text-right">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white sm:divide-y sm:divide-slate-100">
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="transition-colors hover:bg-slate-50/70">
              {columns.map((column) => (
                <td
                  key={column.key}
                  data-label={column.header}
                  data-primary={column.primary ? 'true' : undefined}
                  className={cn(
                    'px-4 py-3 text-slate-700',
                    column.align === 'right' ? 'sm:text-right' : 'sm:text-left',
                    column.numeric && 'numeric',
                    column.hideOnMobile && 'hidden md:table-cell',
                  )}
                >
                  {column.render(row)}
                </td>
              ))}
              {renderActions && (
                <td data-actions="true" className="px-4 py-3 text-right">
                  {renderActions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
