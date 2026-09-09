import { describe, expect, it } from 'vitest'
import { policyApi } from '../api/policyApi'
import { POLICY_SEED } from '../mocks/policyMocks'
import { ApiError } from '@/lib/apiClient'

describe('policyApi', () => {
  it('lists the seeded policies with pagination metadata', async () => {
    const result = await policyApi.list({ page: 1, pageSize: 5, sortBy: 'policyNumber' })

    expect(result.total).toBe(POLICY_SEED.length)
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(5)
    expect(result.items).toHaveLength(5)
    expect(result.items[0].policyNumber).toBe('POL-1001')
  })

  it('paginates without overlapping rows', async () => {
    const first = await policyApi.list({ page: 1, pageSize: 10, sortBy: 'policyNumber' })
    const second = await policyApi.list({ page: 2, pageSize: 10, sortBy: 'policyNumber' })

    expect(first.items).toHaveLength(10)
    expect(second.items).toHaveLength(2)
    expect(second.items.map((policy) => policy.policyNumber)).toEqual(['POL-1011', 'POL-1012'])
  })

  it('searches across string fields, case-insensitively', async () => {
    const result = await policyApi.list({ search: 'amelia' })

    expect(result.total).toBe(1)
    expect(result.items[0].holderName).toBe('Amelia Hart')
  })

  it('filters on exact field values', async () => {
    const result = await policyApi.list({ filters: { status: 'active' }, pageSize: 50 })

    expect(result.total).toBeGreaterThan(0)
    expect(result.items.every((policy) => policy.status === 'active')).toBe(true)
  })

  it('sorts numerically in both directions', async () => {
    const asc = await policyApi.list({ sortBy: 'premium', sortDir: 'asc', pageSize: 50 })
    const desc = await policyApi.list({ sortBy: 'premium', sortDir: 'desc', pageSize: 50 })

    expect(asc.items[0].premium).toBeLessThan(asc.items[asc.items.length - 1].premium)
    expect(desc.items[0].premium).toBe(asc.items[asc.items.length - 1].premium)
  })

  it('reads a single policy and rejects unknown ids', async () => {
    await expect(policyApi.get(1)).resolves.toMatchObject({ policyNumber: 'POL-1001' })
    await expect(policyApi.get(9999)).rejects.toBeInstanceOf(ApiError)
  })

  it('creates a policy with a fresh id', async () => {
    const created = await policyApi.create({
      policyNumber: 'POL-2001',
      holderName: 'Test Holder',
      type: 'auto',
      premium: 999.99,
      status: 'pending',
    })

    expect(created.id).toBeGreaterThan(POLICY_SEED.length)

    const result = await policyApi.list({ search: 'POL-2001' })
    expect(result.total).toBe(1)
  })

  it('updates a policy in place', async () => {
    const updated = await policyApi.update(1, {
      policyNumber: 'POL-1001',
      holderName: 'Amelia Hart-Reyes',
      type: 'auto',
      premium: 1300,
      status: 'active',
    })

    expect(updated.id).toBe(1)
    await expect(policyApi.get(1)).resolves.toMatchObject({ holderName: 'Amelia Hart-Reyes' })
  })

  it('removes a policy and rejects a second removal', async () => {
    await policyApi.remove(1)

    const result = await policyApi.list({ pageSize: 50 })
    expect(result.total).toBe(POLICY_SEED.length - 1)
    await expect(policyApi.remove(1)).rejects.toBeInstanceOf(ApiError)
  })

  it('resets the store between tests', async () => {
    const result = await policyApi.list({ pageSize: 50 })
    expect(result.total).toBe(POLICY_SEED.length)
  })

  it('exposes dropdown options for the claim form', async () => {
    const options = await policyApi.options()

    expect(options).toHaveLength(POLICY_SEED.length)
    expect(options[0]).toEqual({ value: '1', label: 'POL-1001 — Amelia Hart' })
  })
})
