import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { resetPolicyStore } from './src/features/policies/mocks/policyMocks'
import { resetClaimStore } from './src/features/claims/mocks/claimMocks'

beforeEach(() => {
  resetPolicyStore()
  resetClaimStore()
})

afterEach(() => {
  cleanup()
})
