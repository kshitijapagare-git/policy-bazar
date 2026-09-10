import { describe, expect, it } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderRoute } from '@/test/utils'
import { PolicyFormPage } from '../pages/PolicyFormPage'
import { policyApi } from '../api/policyApi'

function renderCreate() {
  return renderRoute(<PolicyFormPage />, {
    path: '/policies/new',
    initialEntries: ['/policies/new'],
  })
}

function renderEdit(id = 1) {
  return renderRoute(<PolicyFormPage />, {
    path: '/policies/:id/edit',
    initialEntries: [`/policies/${id}/edit`],
  })
}

describe('PolicyFormPage', () => {
  it('renders a blank create form', () => {
    renderCreate()

    expect(screen.getByRole('heading', { name: 'New policy', level: 1 })).toBeInTheDocument()
    expect(screen.getByLabelText(/Policy number/)).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Create policy' })).toBeInTheDocument()
  })

  it('blocks submission and reports every missing field', async () => {
    const user = userEvent.setup()
    renderCreate()

    await user.click(screen.getByRole('button', { name: 'Create policy' }))

    expect(await screen.findByText('Policy number is required')).toBeInTheDocument()
    expect(screen.getByText('Holder name is required')).toBeInTheDocument()
    expect(screen.getByText('Type is required')).toBeInTheDocument()
    expect(screen.getByText('Status is required')).toBeInTheDocument()
    expect(screen.getByText('Premium must be greater than zero')).toBeInTheDocument()
    expect(screen.getByText('Renewal date is required')).toBeInTheDocument()

    // Nothing was written to the store.
    await expect(policyApi.list({ pageSize: 50 })).resolves.toMatchObject({ total: 12 })
  })

  it('clears a field error once the field is corrected', async () => {
    const user = userEvent.setup()
    renderCreate()

    await user.click(screen.getByRole('button', { name: 'Create policy' }))
    expect(await screen.findByText('Holder name is required')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Holder name/), 'New Holder')

    expect(screen.queryByText('Holder name is required')).not.toBeInTheDocument()
  })

  it('clears the renewal date error once a date is chosen', async () => {
    const user = userEvent.setup()
    renderCreate()

    await user.click(screen.getByRole('button', { name: 'Create policy' }))
    expect(await screen.findByText('Renewal date is required')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/Renewal date/), { target: { value: '2026-03-04' } })

    expect(screen.queryByText('Renewal date is required')).not.toBeInTheDocument()
  })

  it('creates a policy and navigates to its detail page', async () => {
    const user = userEvent.setup()
    renderCreate()

    await user.type(screen.getByLabelText(/Policy number/), 'POL-3001')
    await user.type(screen.getByLabelText(/Holder name/), 'Iris Bell')
    await user.selectOptions(screen.getByLabelText(/Type/), 'home')
    await user.clear(screen.getByLabelText(/Premium/))
    await user.type(screen.getByLabelText(/Premium/), '1450.25')
    await user.selectOptions(screen.getByLabelText(/Status/), 'active')
    fireEvent.change(screen.getByLabelText(/Renewal date/), { target: { value: '2026-03-04' } })

    await user.click(screen.getByRole('button', { name: 'Create policy' }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/policies/13')
    })

    await expect(policyApi.get(13)).resolves.toMatchObject({
      policyNumber: 'POL-3001',
      holderName: 'Iris Bell',
      type: 'home',
      premium: 1450.25,
      status: 'active',
      renewalDate: '2026-03-04',
    })
  })

  it('loads existing values into the edit form', async () => {
    renderEdit(1)

    expect(
      await screen.findByRole('heading', { name: 'Edit policy', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/Policy number/)).toHaveValue('POL-1001')
    expect(screen.getByLabelText(/Holder name/)).toHaveValue('Amelia Hart')
    expect(screen.getByLabelText(/Premium/)).toHaveValue(1240.5)
    expect(screen.getByLabelText(/Renewal date/)).toHaveValue('2026-01-15')
  })

  it('saves an edit without changing the id', async () => {
    const user = userEvent.setup()
    renderEdit(1)

    const holder = await screen.findByLabelText(/Holder name/)
    await user.clear(holder)
    await user.type(holder, 'Amelia Reyes')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/policies/1')
    })

    await expect(policyApi.get(1)).resolves.toMatchObject({
      id: 1,
      holderName: 'Amelia Reyes',
      renewalDate: '2026-01-15',
    })
  })

  it('cancels back to the list', async () => {
    const user = userEvent.setup()
    renderCreate()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/policies')
  })
})
