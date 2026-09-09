import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate, formatNumber, humanize, truncate } from '../formatters'
import { cn } from '../cn'

describe('formatCurrency', () => {
  it('formats numbers as USD', () => {
    expect(formatCurrency(1240.5)).toBe('$1,240.50')
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('falls back to a dash for missing values', () => {
    expect(formatCurrency(null)).toBe('-')
    expect(formatCurrency(undefined)).toBe('-')
    expect(formatCurrency(Number.NaN)).toBe('-')
  })
})

describe('formatNumber', () => {
  it('groups thousands', () => {
    expect(formatNumber(12345)).toBe('12,345')
  })

  it('falls back to a dash for missing values', () => {
    expect(formatNumber(null)).toBe('-')
  })
})

describe('formatDate', () => {
  it('renders an ISO date', () => {
    expect(formatDate('2026-03-04T00:00:00.000Z')).toBe('Mar 4, 2026')
  })

  it('falls back to a dash for empty or invalid input', () => {
    expect(formatDate('')).toBe('-')
    expect(formatDate('not-a-date')).toBe('-')
  })
})

describe('humanize', () => {
  it('turns snake_case and camelCase into title case', () => {
    expect(humanize('under_review')).toBe('Under Review')
    expect(humanize('policyNumber')).toBe('Policy Number')
    expect(humanize('active')).toBe('Active')
  })

  it('falls back to a dash for empty input', () => {
    expect(humanize('')).toBe('-')
  })
})

describe('truncate', () => {
  it('leaves short strings alone', () => {
    expect(truncate('short', 10)).toBe('short')
  })

  it('ellipsises longer strings', () => {
    expect(truncate('abcdefghij', 5)).toBe('abcd…')
  })
})

describe('cn', () => {
  it('joins truthy values and drops the rest', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
  })

  it('supports conditional objects and nested arrays', () => {
    expect(cn('base', { active: true, hidden: false }, ['x', ['y']])).toBe('base active x y')
  })
})
