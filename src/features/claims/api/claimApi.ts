import { USE_MOCK, ApiError, apiClient } from '@/lib/apiClient'
import { mockDelay, queryCollection } from '@/lib/mockQuery'
import { getClaimStore, setClaimStore, takeNextClaimId } from '../mocks/claimMocks'
import type { Claim, ClaimInput, ListParams, Paginated } from '@/types'

const RESOURCE = 'claims'

/** Declared by the spec: `search: { fields: ["description"] }`. */
const SEARCH_FIELDS: (keyof Claim)[] = ['description']

export const claimApi = {
  async list(params: ListParams = {}): Promise<Paginated<Claim>> {
    if (!USE_MOCK) {
      const { filters, ...rest } = params
      return apiClient.get<Paginated<Claim>>(RESOURCE, { ...rest, ...filters })
    }

    await mockDelay()
    return queryCollection(getClaimStore(), params, { searchFields: SEARCH_FIELDS })
  },

  async get(id: number): Promise<Claim> {
    if (!USE_MOCK) return apiClient.get<Claim>(`${RESOURCE}/${id}`)

    await mockDelay()
    const found = getClaimStore().find((claim) => claim.id === id)
    if (!found) throw new ApiError(404, `Claim ${id} not found`)
    return { ...found }
  },

  async create(input: ClaimInput): Promise<Claim> {
    if (!USE_MOCK) return apiClient.post<Claim>(RESOURCE, input)

    await mockDelay()
    const created: Claim = { ...input, id: takeNextClaimId() }
    setClaimStore([...getClaimStore(), created])
    return { ...created }
  },

  async update(id: number, input: ClaimInput): Promise<Claim> {
    if (!USE_MOCK) return apiClient.put<Claim>(`${RESOURCE}/${id}`, input)

    await mockDelay()
    const store = getClaimStore()
    const index = store.findIndex((claim) => claim.id === id)
    if (index === -1) throw new ApiError(404, `Claim ${id} not found`)

    const updated: Claim = { ...input, id }
    const next = [...store]
    next[index] = updated
    setClaimStore(next)
    return { ...updated }
  },

  async remove(id: number): Promise<void> {
    if (!USE_MOCK) {
      await apiClient.delete<void>(`${RESOURCE}/${id}`)
      return
    }

    await mockDelay()
    const store = getClaimStore()
    if (!store.some((claim) => claim.id === id)) {
      throw new ApiError(404, `Claim ${id} not found`)
    }
    setClaimStore(store.filter((claim) => claim.id !== id))
  },

  /** Claims belonging to one policy - used by the policy detail page. */
  async listByPolicy(policyId: number): Promise<Claim[]> {
    const { items } = await claimApi.list({
      page: 1,
      pageSize: 1000,
      filters: { policyId: String(policyId) },
      sortBy: 'claimNumber',
    })
    return items
  },
}
