import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderRoute } from '@/test/utils'
import { PolicyListPage } from '../pages/PolicyListPage'
import { policyApi } from '../api/policyApi'

function renderPage() {
  return renderRoute(<PolicyListPage />, { path: '/policies', initialEntries: ['/policies'] })
}

describe('PolicyListPage', () => {
  it('renders the first page of policies', async () => {
    renderPage()

    expect(await screen.findByText('POL-1001')).toBeInTheDocument()
    expect(screen.getByText('Amelia Hart')).toBeInTheDocument()
    expect(screen.getByText('$1,240.50')).toBeInTheDocument()

    // Page size is 10, so the 11th and 12th seeds land on page two.
    expect(screen.queryByText('POL-1011')).not.toBeInTheDocument()
  })

  it('shows the pagination summary', async () => {
    renderPage()

    await screen.findByText('POL-1001')
    const pagination = screen.getByRole('navigation', { name: 'Pagination' })
    expect(within(pagination).getByText('Page 1 of 2')).toBeInTheDocument()
  })

  it('moves to the next page', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('POL-1001')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(await screen.findByText('POL-1011')).toBeInTheDocument()
    expect(screen.queryByText('POL-1001')).not.toBeInTheDocument()
  })

  it('narrows the list with the search box', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('POL-1001')
    await user.type(screen.getByRole('searchbox', { name: 'Search policies' }), 'Ravi')

    await waitFor(() => {
      expect(screen.getByText('POL-1002')).toBeInTheDocument()
      expect(screen.queryByText('POL-1001')).not.toBeInTheDocument()
    })
  })

  it('filters by status', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('POL-1003')
    await user.selectOptions(screen.getByLabelText('Status'), 'pending')

    await waitFor(() => {
      expect(screen.queryByText('POL-1001')).not.toBeInTheDocument()
    })
    expect(screen.getByText('POL-1003')).toBeInTheDocument()
    expect(screen.getByText('POL-1008')).toBeInTheDocument()
  })

  it('sorts by premium when the column header is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('POL-1001')
    await user.click(screen.getByRole('button', { name: /premium/i }))

    await waitFor(() => {
      const rows = screen.getAllByRole('row').slice(1)
      expect(within(rows[0]).getByText('POL-1005')).toBeInTheDocument()
    })
  })

  it('reports an empty result set', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('POL-1001')
    await user.type(screen.getByRole('searchbox', { name: 'Search policies' }), 'zzzzz')

    expect(await screen.findByText('No policies found')).toBeInTheDocument()
  })

  it('deletes a policy after confirmation', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('POL-1001')

    await user.click(screen.getByRole('button', { name: 'Actions for POL-1001' }))
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }))

    const dialog = await screen.findByRole('dialog', { name: 'Delete policy' })
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(screen.queryByText('POL-1001')).not.toBeInTheDocument()
    })
    await expect(policyApi.list({ pageSize: 50 })).resolves.toMatchObject({ total: 11 })
  })

  it('keeps the policy when the delete dialog is cancelled', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('POL-1001')

    await user.click(screen.getByRole('button', { name: 'Actions for POL-1001' }))
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }))

    const dialog = await screen.findByRole('dialog', { name: 'Delete policy' })
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    expect(screen.getByText('POL-1001')).toBeInTheDocument()
  })

  it('navigates to the create form', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('POL-1001')
    await user.click(screen.getByRole('button', { name: 'New policy' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/policies/new')
  })
})
