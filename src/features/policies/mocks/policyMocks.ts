import type { Policy } from '@/types'

export const POLICY_SEED: readonly Policy[] = [
  {
    id: 1,
    policyNumber: 'POL-1001',
    holderName: 'Amelia Hart',
    type: 'auto',
    premium: 1240.5,
    status: 'active',
    renewalDate: '2026-01-15',
  },
  {
    id: 2,
    policyNumber: 'POL-1002',
    holderName: 'Ravi Deshmukh',
    type: 'home',
    premium: 2310,
    status: 'active',
    renewalDate: '2026-02-20',
  },
  {
    id: 3,
    policyNumber: 'POL-1003',
    holderName: 'Sofia Marino',
    type: 'life',
    premium: 890.75,
    status: 'pending',
    renewalDate: '2026-03-04',
  },
  {
    id: 4,
    policyNumber: 'POL-1004',
    holderName: 'Daniel Okafor',
    type: 'health',
    premium: 3145.2,
    status: 'active',
    renewalDate: '2026-04-11',
  },
  {
    id: 5,
    policyNumber: 'POL-1005',
    holderName: 'Mei Tanaka',
    type: 'travel',
    premium: 210,
    status: 'lapsed',
    renewalDate: '2025-12-01',
  },
  {
    id: 6,
    policyNumber: 'POL-1006',
    holderName: 'Lucas Brandt',
    type: 'auto',
    premium: 1580.4,
    status: 'cancelled',
    renewalDate: '2025-11-18',
  },
  {
    id: 7,
    policyNumber: 'POL-1007',
    holderName: 'Priya Nair',
    type: 'home',
    premium: 1975.6,
    status: 'active',
    renewalDate: '2026-05-09',
  },
  {
    id: 8,
    policyNumber: 'POL-1008',
    holderName: 'Noah Lindqvist',
    type: 'life',
    premium: 1120,
    status: 'pending',
    renewalDate: '2026-06-22',
  },
  {
    id: 9,
    policyNumber: 'POL-1009',
    holderName: 'Grace Mbeki',
    type: 'health',
    premium: 2680.35,
    status: 'active',
    renewalDate: '2026-07-30',
  },
  {
    id: 10,
    policyNumber: 'POL-1010',
    holderName: 'Tomas Silva',
    type: 'travel',
    premium: 345.9,
    status: 'active',
    renewalDate: '2026-08-14',
  },
  {
    id: 11,
    policyNumber: 'POL-1011',
    holderName: 'Hana Yusuf',
    type: 'auto',
    premium: 1410.15,
    status: 'lapsed',
    renewalDate: '2025-10-05',
  },
  {
    id: 12,
    policyNumber: 'POL-1012',
    holderName: 'Oliver Novak',
    type: 'home',
    premium: 2050,
    status: 'active',
    renewalDate: '2026-09-27',
  },
]

let store: Policy[] = []
let nextId = 1

export function resetPolicyStore(): void {
  store = POLICY_SEED.map((policy) => ({ ...policy }))
  nextId = store.reduce((max, policy) => Math.max(max, policy.id), 0) + 1
}

resetPolicyStore()

export function getPolicyStore(): Policy[] {
  return store
}

export function setPolicyStore(next: Policy[]): void {
  store = next
}

export function takeNextPolicyId(): number {
  return nextId++
}
