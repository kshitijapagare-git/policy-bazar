import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderRoute } from '@/test/utils'
import { ClaimFormPage } from '../pages/ClaimFormPage'
import { claimApi } from '../api/claimApi'

function renderCreate() {
  return renderRoute(<ClaimFormPage />, { path: '/claims/new', initialEntries: ['/claims/new'] })
}

function renderEdit(id = 1) {
  return renderRoute(<ClaimFormPage />, {
    path: '/claims/:id/edit',
    initialEntries: [`/claims/${id}/edit`],
  })
}

describe('ClaimFormPage', () => {
  it('renders a blank create form', async () => {
    renderCreate()

    expect(screen.getByRole('heading', { name: 'New claim', level: 1 })).toBeInTheDocument()
    expect(screen.getByLabelText(/Claim number/)).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Create claim' })).toBeInTheDocument()

    // Let the policy dropdown settle so the load doesn't land after teardown.
    await screen.findByRole('option', { name: 'POL-1001 — Amelia Hart' })
  })

  it('populates the policy dropdown from the policy list', async () => {
    renderCreate()

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'POL-1001 — Amelia Hart' })).toBeInTheDocument()
    })

    // 12 seeded policies plus the placeholder, scoped to the policy select.
    const policySelect = screen.getByLabelText(/^Policy/)
    expect(within(policySelect).getAllByRole('option')).toHaveLength(13)
  })

  it('blocks submission and reports every missing field', async () => {
    const user = userEvent.setup()
    renderCreate()

    await user.click(screen.getByRole('button', { name: 'Create claim' }))

    expect(await screen.findByText('Claim number is required')).toBeInTheDocument()
    expect(screen.getByText('Policy is required')).toBeInTheDocument()
    expect(screen.getByText('Description is required')).toBeInTheDocument()
    expect(screen.getByText('Status is required')).toBeInTheDocument()
    expect(screen.getByText('Amount must be greater than zero')).toBeInTheDocument()

    await expect(claimApi.list({ pageSize: 50 })).resolves.toMatchObject({ total: 12 })
  })

  it('creates a claim and navigates to its detail page', async () => {
    const user = userEvent.setup()
    renderCreate()

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'POL-1002 — Ravi Deshmukh' })).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/Claim number/), 'CLM-7001')
    await user.selectOptions(screen.getByLabelText(/^Policy/), '2')
    await user.type(screen.getByLabelText(/Description/), 'Gutter torn off in gale')
    await user.clear(screen.getByLabelText(/Amount/))
    await user.type(screen.getByLabelText(/Amount/), '2410.75')
    await user.selectOptions(screen.getByLabelText(/Status/), 'submitted')

    await user.click(screen.getByRole('button', { name: 'Create claim' }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/claims/13')
    })

    await expect(claimApi.get(13)).resolves.toMatchObject({
      claimNumber: 'CLM-7001',
      policyId: 2,
      description: 'Gutter torn off in gale',
      amount: 2410.75,
      status: 'submitted',
    })
  })

  it('loads existing values into the edit form', async () => {
    renderEdit(1)

    expect(await screen.findByRole('heading', { name: 'Edit claim', level: 1 })).toBeInTheDocument()
    expect(screen.getByLabelText(/Claim number/)).toHaveValue('CLM-5001')
    expect(screen.getByLabelText(/Description/)).toHaveValue('Rear-end collision on Route 9')
    expect(screen.getByLabelText(/Amount/)).toHaveValue(3200)
    await waitFor(() => {
      expect(screen.getByLabelText(/^Policy/)).toHaveValue('1')
    })
  })

  it('saves an edit without changing the id', async () => {
    const user = userEvent.setup()
    renderEdit(1)

    const amount = await screen.findByLabelText(/Amount/)
    await user.clear(amount)
    await user.type(amount, '3555')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/claims/1')
    })

    await expect(claimApi.get(1)).resolves.toMatchObject({ id: 1, amount: 3555 })
  })

  it('cancels back to the list', async () => {
    const user = userEvent.setup()
    renderCreate()

    await screen.findByRole('option', { name: 'POL-1001 — Amelia Hart' })
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/claims')
  })
})
