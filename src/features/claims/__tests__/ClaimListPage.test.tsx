import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderRoute } from '@/test/utils'
import { ClaimListPage } from '../pages/ClaimListPage'
import { claimApi } from '../api/claimApi'

function renderPage() {
  return renderRoute(<ClaimListPage />, { path: '/claims', initialEntries: ['/claims'] })
}

describe('ClaimListPage', () => {
  it('renders the first page of claims', async () => {
    renderPage()

    expect(await screen.findByText('CLM-5001')).toBeInTheDocument()
    expect(screen.getByText('Rear-end collision on Route 9')).toBeInTheDocument()
    expect(screen.getByText('$3,200.00')).toBeInTheDocument()
    expect(screen.queryByText('CLM-5011')).not.toBeInTheDocument()
  })

  it('resolves the policy relation to a readable label', async () => {
    renderPage()

    // CLM-5001 and CLM-5004 both hang off policy 1.
    const labels = await screen.findAllByText('POL-1001 — Amelia Hart')
    expect(labels).toHaveLength(2)
  })

  it('moves to the next page', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('CLM-5001')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(await screen.findByText('CLM-5011')).toBeInTheDocument()
    expect(screen.queryByText('CLM-5001')).not.toBeInTheDocument()
  })

  it('searches claim descriptions', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('CLM-5001')
    await user.type(screen.getByRole('searchbox', { name: 'Search claims' }), 'luggage')

    await waitFor(() => {
      expect(screen.getByText('CLM-5006')).toBeInTheDocument()
      expect(screen.queryByText('CLM-5001')).not.toBeInTheDocument()
    })
  })

  it('filters by status', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('CLM-5001')
    await user.selectOptions(screen.getByLabelText('Status'), 'submitted')

    await waitFor(() => {
      expect(screen.queryByText('CLM-5001')).not.toBeInTheDocument()
    })
    expect(screen.getByText('CLM-5004')).toBeInTheDocument()
    expect(screen.getByText('CLM-5008')).toBeInTheDocument()
  })

  it('combines search and status filter', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('CLM-5001')
    await user.type(screen.getByRole('searchbox', { name: 'Search claims' }), 'replacement')

    await waitFor(() => {
      expect(screen.getByText('CLM-5004')).toBeInTheDocument()
      expect(screen.getByText('CLM-5012')).toBeInTheDocument()
    })

    await user.selectOptions(screen.getByLabelText('Status'), 'submitted')

    await waitFor(() => {
      expect(screen.getByText('CLM-5004')).toBeInTheDocument()
      expect(screen.queryByText('CLM-5012')).not.toBeInTheDocument()
    })
  })

  it('sorts by amount when the column header is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('CLM-5001')
    await user.click(screen.getByRole('button', { name: /amount/i }))

    await waitFor(() => {
      const rows = screen.getAllByRole('row').slice(1)
      expect(within(rows[0]).getByText('CLM-5004')).toBeInTheDocument()
    })
  })

  it('reports an empty result set', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('CLM-5001')
    await user.type(screen.getByRole('searchbox', { name: 'Search claims' }), 'zzzzz')

    expect(await screen.findByText('No claims found')).toBeInTheDocument()
  })

  it('deletes a claim after confirmation', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('CLM-5001')

    await user.click(screen.getByRole('button', { name: 'Actions for CLM-5001' }))
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }))

    const dialog = await screen.findByRole('dialog', { name: 'Delete claim' })
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(screen.queryByText('CLM-5001')).not.toBeInTheDocument()
    })
    await expect(claimApi.list({ pageSize: 50 })).resolves.toMatchObject({ total: 11 })
  })

  it('navigates to the create form', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('CLM-5001')
    await user.click(screen.getByRole('button', { name: 'New claim' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/claims/new')
  })
})
