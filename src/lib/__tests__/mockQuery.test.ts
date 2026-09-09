import { describe, expect, it } from 'vitest'
import { queryCollection } from '../mockQuery'

interface Row {
  id: number
  name: string
  score: number
  tag: string
}

const ROWS: Row[] = [
  { id: 1, name: 'Charlie', score: 30, tag: 'red' },
  { id: 2, name: 'alice', score: 10, tag: 'blue' },
  { id: 3, name: 'Bob', score: 20, tag: 'red' },
]

describe('queryCollection', () => {
  it('returns everything on one page by default', () => {
    const result = queryCollection(ROWS)

    expect(result.total).toBe(3)
    expect(result.items).toHaveLength(3)
    expect(result.page).toBe(1)
  })

  it('does not mutate the source array when sorting', () => {
    queryCollection(ROWS, { sortBy: 'score', sortDir: 'desc' })

    expect(ROWS.map((row) => row.id)).toEqual([1, 2, 3])
  })

  it('sorts strings case-insensitively by locale', () => {
    const result = queryCollection(ROWS, { sortBy: 'name' })

    expect(result.items.map((row) => row.name)).toEqual(['alice', 'Bob', 'Charlie'])
  })

  it('sorts numbers numerically', () => {
    const result = queryCollection(ROWS, { sortBy: 'score', sortDir: 'desc' })

    expect(result.items.map((row) => row.score)).toEqual([30, 20, 10])
  })

  it('searches only the declared fields', () => {
    expect(queryCollection(ROWS, { search: 'ali' }, { searchFields: ['name'] }).total).toBe(1)
    expect(queryCollection(ROWS, { search: 'red' }, { searchFields: ['name'] }).total).toBe(0)
  })

  it('ignores search when no fields are declared', () => {
    expect(queryCollection(ROWS, { search: 'ali' }).total).toBe(3)
  })

  it('applies exact-match filters', () => {
    expect(queryCollection(ROWS, { filters: { tag: 'red' } }).total).toBe(2)
    expect(queryCollection(ROWS, { filters: { tag: '' } }).total).toBe(3)
  })

  it('paginates and still reports the unpaged total', () => {
    const result = queryCollection(ROWS, { page: 2, pageSize: 2, sortBy: 'id' })

    expect(result.total).toBe(3)
    expect(result.items.map((row) => row.id)).toEqual([3])
  })

  it('returns an empty page past the end', () => {
    expect(queryCollection(ROWS, { page: 9, pageSize: 2 }).items).toEqual([])
  })
})
