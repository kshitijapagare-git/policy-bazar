import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderRoute } from '@/test/utils'
import { PolicyDetailPage } from '../pages/PolicyDetailPage'
import { policyApi } from '../api/policyApi'

function renderPage(id = 1) {
  return renderRoute(<PolicyDetailPage />, {
    path: '/policies/:id',
    initialEntries: [`/policies/${id}`],
  })
}

describe('PolicyDetailPage', () => {
  it('renders every field of the policy', async () => {
    renderPage(1)

    expect(await screen.findByRole('heading', { name: 'POL-1001', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('Held by Amelia Hart')).toBeInTheDocument()
    expect(screen.getByText('Auto')).toBeInTheDocument()
    expect(screen.getByText('$1,240.50')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('lists the claims filed against the policy', async () => {
    renderPage(1)

    expect(await screen.findByText('CLM-5001')).toBeInTheDocument()
    expect(screen.getByText('CLM-5004')).toBeInTheDocument()
    expect(screen.getByText('Rear-end collision on Route 9')).toBeInTheDocument()

    // CLM-5002 belongs to policy 2, so it must not leak in.
    expect(screen.queryByText('CLM-5002')).not.toBeInTheDocument()
  })

  it('shows an empty state for a policy with no claims', async () => {
    renderPage(6)

    expect(await screen.findByText('No claims yet')).toBeInTheDocument()
  })

  it('reports a missing policy', async () => {
    renderPage(9999)

    expect(await screen.findByText('Policy not found')).toBeInTheDocument()
  })

  it('navigates to the edit form', async () => {
    const user = userEvent.setup()
    renderPage(1)

    await screen.findByRole('heading', { name: 'POL-1001', level: 1 })
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/policies/1/edit')
  })

  it('deletes the policy and returns to the list', async () => {
    const user = userEvent.setup()
    renderPage(1)

    await screen.findByRole('heading', { name: 'POL-1001', level: 1 })
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    const dialog = await screen.findByRole('dialog', { name: 'Delete policy' })
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/policies')
    })
    await expect(policyApi.get(1)).rejects.toThrow()
  })
})
