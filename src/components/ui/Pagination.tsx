import { Button } from './Button'
import { Select } from './Select'
import { PAGE_SIZE_OPTIONS } from '@/lib/constants'

export interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
    >
      <p className="numeric text-xs text-slate-600">
        Showing <span className="font-semibold text-slate-900">{first}</span>–
        <span className="font-semibold text-slate-900">{last}</span> of{' '}
        <span className="font-semibold text-slate-900">{total}</span>
      </p>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <label htmlFor="page-size" className="whitespace-nowrap text-xs text-slate-600">
              Per page
            </label>
            <Select
              id="page-size"
              className="w-[4.5rem] py-1 text-xs"
              value={String(pageSize)}
              options={PAGE_SIZE_OPTIONS.map((size) => ({
                label: String(size),
                value: String(size),
              }))}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <span className="numeric whitespace-nowrap text-xs text-slate-600">
            Page {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </nav>
  )
}
