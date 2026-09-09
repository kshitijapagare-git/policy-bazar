import { PAGE_SIZE } from './constants'
import type { ListParams, Paginated } from '@/types'

export interface MockQueryOptions<T> {
  /** Fields scanned by the free-text `search` param. */
  searchFields?: (keyof T)[]
}

function compare(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b)
  return String(a ?? '').localeCompare(String(b ?? ''), 'en', { numeric: true })
}

/**
 * Applies search, exact-match filters, sorting and pagination the way the real
 * API would, so the mock stub and a live backend stay interchangeable.
 */
export function queryCollection<T extends object>(
  items: T[],
  params: ListParams = {},
  options: MockQueryOptions<T> = {},
): Paginated<T> {
  const {
    page = 1,
    pageSize = PAGE_SIZE,
    search = '',
    sortBy,
    sortDir = 'asc',
    filters = {},
  } = params
  const { searchFields = [] } = options

  let rows = [...items]

  const term = search.trim().toLowerCase()
  if (term && searchFields.length > 0) {
    rows = rows.filter((row) =>
      searchFields.some((field) =>
        String(row[field] ?? '')
          .toLowerCase()
          .includes(term),
      ),
    )
  }

  for (const [key, value] of Object.entries(filters)) {
    if (!value) continue
    rows = rows.filter((row) => String((row as Record<string, unknown>)[key] ?? '') === value)
  }

  if (sortBy) {
    rows.sort((a, b) => {
      const result = compare(
        (a as Record<string, unknown>)[sortBy],
        (b as Record<string, unknown>)[sortBy],
      )
      return sortDir === 'desc' ? -result : result
    })
  }

  const total = rows.length
  const start = (page - 1) * pageSize

  return { items: rows.slice(start, start + pageSize), total, page, pageSize }
}

/** Keeps the mock feeling like a network call without slowing the tests down. */
export function mockDelay(ms = 0): Promise<void> {
  if (ms <= 0) return Promise.resolve()
  return new Promise((resolve) => setTimeout(resolve, ms))
}
