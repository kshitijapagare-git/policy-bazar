/**
 * Linear claim status workflow:
 * submitted -> under_review -> approved -> settled
 *                           -> rejected -> closed
 *
 * All transitions are one-way forward only; there are no backward or
 * skip transitions, and no role-based restrictions apply.
 */
export const CLAIM_STATUS_TRANSITIONS: Record<string, string[]> = {
  submitted: ['under_review'],
  under_review: ['approved', 'rejected'],
  approved: ['settled'],
  rejected: ['closed'],
  settled: [],
  closed: [],
}

export function getAvailableTransitions(status: string): string[] {
  return CLAIM_STATUS_TRANSITIONS[status] ?? []
}
