import type { Claim } from '@/types'

export const CLAIM_SEED: readonly Claim[] = [
  {
    id: 1,
    claimNumber: 'CLM-5001',
    policyId: 1,
    description: 'Rear-end collision on Route 9',
    amount: 3200,
    status: 'approved',
  },
  {
    id: 2,
    claimNumber: 'CLM-5002',
    policyId: 2,
    description: 'Storm damage to roof shingles',
    amount: 8750.4,
    status: 'under_review',
  },
  {
    id: 3,
    claimNumber: 'CLM-5003',
    policyId: 4,
    description: 'Emergency room visit and imaging',
    amount: 1480.25,
    status: 'paid',
  },
  {
    id: 4,
    claimNumber: 'CLM-5004',
    policyId: 1,
    description: 'Windshield replacement after hail',
    amount: 640,
    status: 'submitted',
  },
  {
    id: 5,
    claimNumber: 'CLM-5005',
    policyId: 7,
    description: 'Basement flooding from burst pipe',
    amount: 12400,
    status: 'under_review',
  },
  {
    id: 6,
    claimNumber: 'CLM-5006',
    policyId: 5,
    description: 'Lost luggage on connecting flight',
    amount: 890.5,
    status: 'rejected',
  },
  {
    id: 7,
    claimNumber: 'CLM-5007',
    policyId: 9,
    description: 'Physiotherapy course after surgery',
    amount: 2150.75,
    status: 'approved',
  },
  {
    id: 8,
    claimNumber: 'CLM-5008',
    policyId: 12,
    description: 'Kitchen fire smoke remediation',
    amount: 15600,
    status: 'submitted',
  },
  {
    id: 9,
    claimNumber: 'CLM-5009',
    policyId: 3,
    description: 'Beneficiary payout review',
    amount: 50000,
    status: 'under_review',
  },
  {
    id: 10,
    claimNumber: 'CLM-5010',
    policyId: 10,
    description: 'Trip cancellation due to illness',
    amount: 1275,
    status: 'paid',
  },
  {
    id: 11,
    claimNumber: 'CLM-5011',
    policyId: 11,
    description: 'Side mirror and door panel repair',
    amount: 720.6,
    status: 'rejected',
  },
  {
    id: 12,
    claimNumber: 'CLM-5012',
    policyId: 2,
    description: 'Fence replacement after windstorm',
    amount: 2980,
    status: 'approved',
  },
]

let store: Claim[] = []
let nextId = 1

export function resetClaimStore(): void {
  store = CLAIM_SEED.map((claim) => ({ ...claim }))
  nextId = store.reduce((max, claim) => Math.max(max, claim.id), 0) + 1
}

resetClaimStore()

export function getClaimStore(): Claim[] {
  return store
}

export function setClaimStore(next: Claim[]): void {
  store = next
}

export function takeNextClaimId(): number {
  return nextId++
}
