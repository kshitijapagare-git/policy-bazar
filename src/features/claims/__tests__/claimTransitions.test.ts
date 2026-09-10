import { describe, expect, it } from 'vitest'
import { CLAIM_STATUS_TRANSITIONS, getAvailableTransitions } from '../lib/claimTransitions'

describe('claimTransitions', () => {
  it('offers under_review as the only next step from submitted', () => {
    expect(getAvailableTransitions('submitted')).toEqual(['under_review'])
  })

  it('offers approved or rejected from under_review', () => {
    expect(getAvailableTransitions('under_review')).toEqual(['approved', 'rejected'])
  })

  it('offers settled as the only next step from approved', () => {
    expect(getAvailableTransitions('approved')).toEqual(['settled'])
  })

  it('offers closed as the only next step from rejected', () => {
    expect(getAvailableTransitions('rejected')).toEqual(['closed'])
  })

  it('has no further transitions from the terminal states', () => {
    expect(getAvailableTransitions('settled')).toEqual([])
    expect(getAvailableTransitions('closed')).toEqual([])
  })

  it('has no transitions for an unrecognized status', () => {
    expect(getAvailableTransitions('bogus')).toEqual([])
  })

  it('never offers a backward transition', () => {
    expect(getAvailableTransitions('approved')).not.toContain('submitted')
    expect(getAvailableTransitions('approved')).not.toContain('under_review')
    expect(getAvailableTransitions('under_review')).not.toContain('submitted')
    expect(getAvailableTransitions('closed')).not.toContain('rejected')
    expect(getAvailableTransitions('settled')).not.toContain('approved')
  })

  it('never offers a skip transition', () => {
    // submitted cannot jump straight to approved/rejected/settled/closed
    expect(getAvailableTransitions('submitted')).not.toContain('approved')
    expect(getAvailableTransitions('submitted')).not.toContain('rejected')
    expect(getAvailableTransitions('submitted')).not.toContain('settled')
    expect(getAvailableTransitions('submitted')).not.toContain('closed')
  })

  it('defines exactly the six canonical statuses in the transition map', () => {
    expect(Object.keys(CLAIM_STATUS_TRANSITIONS).sort()).toEqual(
      ['approved', 'closed', 'rejected', 'settled', 'submitted', 'under_review'].sort(),
    )
  })
})
