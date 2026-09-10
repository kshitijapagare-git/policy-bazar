import { describe, expect, it } from 'vitest'
import { claimApi } from '../api/claimApi'
import { CLAIM_SEED } from '../mocks/claimMocks'
import { ApiError } from '@/lib/apiClient'

describe('claimApi', () => {
  it('lists the seeded claims with pagination metadata', async () => {
    const result = await claimApi.list({ page: 1, pageSize: 5, sortBy: 'claimNumber' })

    expect(result.total).toBe(CLAIM_SEED.length)
    expect(result.items).toHaveLength(5)
    expect(result.items[0].claimNumber).toBe('CLM-5001')
  })

  it('paginates without overlapping rows', async () => {
    const second = await claimApi.list({ page: 2, pageSize: 10, sortBy: 'claimNumber' })

    expect(second.items.map((claim) => claim.claimNumber)).toEqual(['CLM-5011', 'CLM-5012'])
  })

  it('searches the description field', async () => {
    const result = await claimApi.list({ search: 'luggage' })

    expect(result.total).toBe(1)
    expect(result.items[0].claimNumber).toBe('CLM-5006')
  })

  it('does not search fields outside the spec search config', async () => {
    // The spec declares `search: { fields: ["description"] }` only.
    const result = await claimApi.list({ search: 'CLM-5001' })

    expect(result.total).toBe(0)
  })

  it('filters by status', async () => {
    const result = await claimApi.list({ filters: { status: 'submitted' }, pageSize: 50 })

    expect(result.items.map((claim) => claim.claimNumber)).toEqual(['CLM-5004', 'CLM-5008'])
  })

  it('combines search and status filter with AND semantics', async () => {
    // "replacement" appears in both CLM-5004 (submitted) and CLM-5012 (approved).
    const both = await claimApi.list({ search: 'replacement', pageSize: 50 })
    expect(both.items.map((claim) => claim.claimNumber)).toEqual(['CLM-5004', 'CLM-5012'])

    const narrowed = await claimApi.list({
      search: 'replacement',
      filters: { status: 'submitted' },
      pageSize: 50,
    })

    expect(narrowed.items.map((claim) => claim.claimNumber)).toEqual(['CLM-5004'])
  })

  it('filters by the policyId relation', async () => {
    const result = await claimApi.list({ filters: { policyId: '1' }, pageSize: 50 })

    expect(result.total).toBe(2)
    expect(result.items.every((claim) => claim.policyId === 1)).toBe(true)
  })

  it('sorts numerically by amount', async () => {
    const result = await claimApi.list({ sortBy: 'amount', sortDir: 'asc', pageSize: 50 })

    expect(result.items[0].claimNumber).toBe('CLM-5004')
    expect(result.items[result.items.length - 1].claimNumber).toBe('CLM-5009')
  })

  it('reads a single claim and rejects unknown ids', async () => {
    await expect(claimApi.get(1)).resolves.toMatchObject({ claimNumber: 'CLM-5001' })
    await expect(claimApi.get(9999)).rejects.toBeInstanceOf(ApiError)
  })

  it('creates a claim with a fresh id', async () => {
    const created = await claimApi.create({
      claimNumber: 'CLM-9001',
      policyId: 2,
      description: 'Hail dents across the bonnet',
      amount: 1875.5,
      status: 'submitted',
    })

    expect(created.id).toBe(CLAIM_SEED.length + 1)
    await expect(claimApi.get(created.id)).resolves.toMatchObject({ claimNumber: 'CLM-9001' })
  })

  it('updates a claim in place', async () => {
    const updated = await claimApi.update(1, {
      claimNumber: 'CLM-5001',
      policyId: 1,
      description: 'Rear-end collision on Route 9',
      amount: 3400,
      status: 'settled',
    })

    expect(updated.id).toBe(1)
    await expect(claimApi.get(1)).resolves.toMatchObject({ amount: 3400, status: 'settled' })
  })

  it('removes a claim and rejects a second removal', async () => {
    await claimApi.remove(1)

    const result = await claimApi.list({ pageSize: 50 })
    expect(result.total).toBe(CLAIM_SEED.length - 1)
    await expect(claimApi.remove(1)).rejects.toBeInstanceOf(ApiError)
  })

  it('lists the claims belonging to one policy', async () => {
    const claims = await claimApi.listByPolicy(1)

    expect(claims.map((claim) => claim.claimNumber)).toEqual(['CLM-5001', 'CLM-5004'])
    await expect(claimApi.listByPolicy(6)).resolves.toEqual([])
  })

  it('transitions a claim to the next status', async () => {
    const updated = await claimApi.transition(4, 'under_review')

    expect(updated.status).toBe('under_review')
    await expect(claimApi.get(4)).resolves.toMatchObject({ status: 'under_review' })
  })

  it('only touches the status field when transitioning', async () => {
    const before = await claimApi.get(4)
    const updated = await claimApi.transition(4, 'under_review')

    expect(updated.claimNumber).toBe(before.claimNumber)
    expect(updated.policyId).toBe(before.policyId)
    expect(updated.description).toBe(before.description)
    expect(updated.amount).toBe(before.amount)
  })

  it('rejects a transition for an unknown claim id', async () => {
    await expect(claimApi.transition(9999, 'under_review')).rejects.toBeInstanceOf(ApiError)
  })
})
