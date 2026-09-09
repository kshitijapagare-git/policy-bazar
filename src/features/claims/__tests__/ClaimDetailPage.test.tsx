import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderRoute } from '@/test/utils'
import { ClaimDetailPage } from '../pages/ClaimDetailPage'
import { claimApi } from '../api/claimApi'

function renderPage(id = 1) {
  return renderRoute(<ClaimDetailPage />, {
    path: '/claims/:id',
    initialEntries: [`/claims/${id}`],
  })
}

describe('ClaimDetailPage', () => {
  it('renders every field of the claim', async () => {
    renderPage(1)

    expect(await screen.findByRole('heading', { name: 'CLM-5001', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('Rear-end collision on Route 9')).toBeInTheDocument()
    expect(screen.getAllByText('$3,200.00').length).toBeGreaterThan(0)
    expect(screen.getByText('Approved')).toBeInTheDocument()
  })

  it('resolves and links the related policy', async () => {
    renderPage(1)

    const link = await screen.findByRole('link', { name: 'POL-1001 — Amelia Hart' })
    expect(link).toHaveAttribute('href', '/policies/1')
  })

  it('reports a missing claim', async () => {
    renderPage(9999)

    expect(await screen.findByText('Claim not found')).toBeInTheDocument()
  })

  it('navigates to the edit form', async () => {
    const user = userEvent.setup()
    renderPage(1)

    await screen.findByRole('heading', { name: 'CLM-5001', level: 1 })
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/claims/1/edit')
  })

  it('deletes the claim and returns to the list', async () => {
    const user = userEvent.setup()
    renderPage(1)

    await screen.findByRole('heading', { name: 'CLM-5001', level: 1 })
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    const dialog = await screen.findByRole('dialog', { name: 'Delete claim' })
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/claims')
    })
    await expect(claimApi.get(1)).rejects.toThrow()
  })

  it('keeps the claim when the dialog is dismissed', async () => {
    const user = userEvent.setup()
    renderPage(1)

    await screen.findByRole('heading', { name: 'CLM-5001', level: 1 })
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    const dialog = await screen.findByRole('dialog', { name: 'Delete claim' })
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    await expect(claimApi.get(1)).resolves.toMatchObject({ claimNumber: 'CLM-5001' })
  })
})
