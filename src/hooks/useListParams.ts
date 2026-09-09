import { useCallback, useMemo, useState } from 'react'
import { PAGE_SIZE } from '@/lib/constants'
import type { ListParams, SortDirection } from '@/types'

export interface UseListParamsOptions {
  initialSortBy?: string
  initialSortDir?: SortDirection
  pageSize?: number
}

/**
 * Owns the page/search/sort/filter state a list page needs. Anything that
 * changes which rows match resets the page back to 1.
 */
export function useListParams({
  initialSortBy,
  initialSortDir = 'asc',
  pageSize: initialPageSize = PAGE_SIZE,
}: UseListParamsOptions = {}) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSizeState] = useState(initialPageSize)
  const [search, setSearchState] = useState('')
  const [sortBy, setSortBy] = useState<string | undefined>(initialSortBy)
  const [sortDir, setSortDir] = useState<SortDirection>(initialSortDir)
  const [filters, setFiltersState] = useState<Record<string, string>>({})

  const setSearch = useCallback((value: string) => {
    setSearchState(value)
    setPage(1)
  }, [])

  const setPageSize = useCallback((value: number) => {
    setPageSizeState(value)
    setPage(1)
  }, [])

  const setFilter = useCallback((key: string, value: string) => {
    setFiltersState((current) => {
      const next = { ...current }
      if (value) next[key] = value
      else delete next[key]
      return next
    })
    setPage(1)
  }, [])

  const resetFilters = useCallback(() => {
    setFiltersState({})
    setPage(1)
  }, [])

  /** Clicking the active column flips direction; a new column starts ascending. */
  const toggleSort = useCallback((key: string) => {
    setSortBy((currentKey) => {
      if (currentKey === key) {
        setSortDir((direction) => (direction === 'asc' ? 'desc' : 'asc'))
        return currentKey
      }
      setSortDir('asc')
      return key
    })
    setPage(1)
  }, [])

  const params: ListParams = useMemo(
    () => ({ page, pageSize, search, sortBy, sortDir, filters }),
    [page, pageSize, search, sortBy, sortDir, filters],
  )

  return {
    params,
    page,
    pageSize,
    search,
    sortBy,
    sortDir,
    filters,
    setPage,
    setPageSize,
    setSearch,
    setFilter,
    resetFilters,
    toggleSort,
  }
}
