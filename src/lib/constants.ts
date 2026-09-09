import type { SelectOption } from '@/types'

export const APP_TITLE = 'Insurance Portal'

export const PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50]

export const POLICY_TYPES: SelectOption[] = [
  { label: 'Auto', value: 'auto' },
  { label: 'Home', value: 'home' },
  { label: 'Life', value: 'life' },
  { label: 'Health', value: 'health' },
  { label: 'Travel', value: 'travel' },
]

export const POLICY_STATUSES: SelectOption[] = [
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Lapsed', value: 'lapsed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export const CLAIM_STATUSES: SelectOption[] = [
  { label: 'Submitted', value: 'submitted' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Paid', value: 'paid' },
]

/** Drives the tone of <StatusBadge>. Anything unlisted falls back to neutral. */
export const STATUS_TONES: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  active: 'success',
  approved: 'success',
  paid: 'success',
  pending: 'warning',
  submitted: 'info',
  under_review: 'warning',
  lapsed: 'danger',
  cancelled: 'neutral',
  rejected: 'danger',
}

export const NAV_ITEMS = [
  { label: 'Dashboard', to: '/', icon: 'dashboard' },
  { label: 'Policies', to: '/policies', icon: 'shield' },
  { label: 'Claims', to: '/claims', icon: 'claim' },
] as const
