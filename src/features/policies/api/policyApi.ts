import { USE_MOCK, ApiError, apiClient } from '@/lib/apiClient'
import { mockDelay, queryCollection } from '@/lib/mockQuery'
import { getPolicyStore, setPolicyStore, takeNextPolicyId } from '../mocks/policyMocks'
import type { ListParams, Paginated, Policy, PolicyInput, SelectOption } from '@/types'

const RESOURCE = 'policies'

/** Free-text search covers every string field, matching the generated default. */
const SEARCH_FIELDS: (keyof Policy)[] = ['policyNumber', 'holderName', 'type', 'status']

export const policyApi = {
  async list(params: ListParams = {}): Promise<Paginated<Policy>> {
    if (!USE_MOCK) {
      const { filters, ...rest } = params
      return apiClient.get<Paginated<Policy>>(RESOURCE, { ...rest, ...filters })
    }

    await mockDelay()
    return queryCollection(getPolicyStore(), params, { searchFields: SEARCH_FIELDS })
  },

  async get(id: number): Promise<Policy> {
    if (!USE_MOCK) return apiClient.get<Policy>(`${RESOURCE}/${id}`)

    await mockDelay()
    const found = getPolicyStore().find((policy) => policy.id === id)
    if (!found) throw new ApiError(404, `Policy ${id} not found`)
    return { ...found }
  },

  async create(input: PolicyInput): Promise<Policy> {
    if (!USE_MOCK) return apiClient.post<Policy>(RESOURCE, input)

    await mockDelay()
    const created: Policy = { ...input, id: takeNextPolicyId() }
    setPolicyStore([...getPolicyStore(), created])
    return { ...created }
  },

  async update(id: number, input: PolicyInput): Promise<Policy> {
    if (!USE_MOCK) return apiClient.put<Policy>(`${RESOURCE}/${id}`, input)

    await mockDelay()
    const store = getPolicyStore()
    const index = store.findIndex((policy) => policy.id === id)
    if (index === -1) throw new ApiError(404, `Policy ${id} not found`)

    const updated: Policy = { ...input, id }
    const next = [...store]
    next[index] = updated
    setPolicyStore(next)
    return { ...updated }
  },

  async remove(id: number): Promise<void> {
    if (!USE_MOCK) {
      await apiClient.delete<void>(`${RESOURCE}/${id}`)
      return
    }

    await mockDelay()
    const store = getPolicyStore()
    if (!store.some((policy) => policy.id === id)) {
      throw new ApiError(404, `Policy ${id} not found`)
    }
    setPolicyStore(store.filter((policy) => policy.id !== id))
  },

  /** Feeds the policy dropdown on the claim form. */
  async options(): Promise<SelectOption[]> {
    const { items } = await policyApi.list({ page: 1, pageSize: 1000, sortBy: 'policyNumber' })
    return items.map((policy) => ({
      value: String(policy.id),
      label: `${policy.policyNumber} — ${policy.holderName}`,
    }))
  },
}
