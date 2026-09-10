export interface Policy {
  id: number
  policyNumber: string
  holderName: string
  type: string
  premium: number
  status: string
  renewalDate: string
}

export interface Claim {
  id: number
  claimNumber: string
  policyId: number
  description: string
  amount: number
  status: string
}

/** Payload shape for create/update - the server owns `id`. */
export type PolicyInput = Omit<Policy, 'id'>
export type ClaimInput = Omit<Claim, 'id'>

export type SortDirection = 'asc' | 'desc'

export interface ListParams {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortDir?: SortDirection
  filters?: Record<string, string>
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface SelectOption {
  label: string
  value: string
}
