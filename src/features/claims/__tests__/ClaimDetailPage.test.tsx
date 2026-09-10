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

  it('moves a submitted claim to under review after confirming', async () => {
    const user = userEvent.setup()
    renderPage(4)

    await screen.findByRole('heading', { name: 'CLM-5004', level: 1 })
    expect(screen.getByText('Submitted')).toBeInTheDocument()

    const transitionButton = screen.getByRole('button', { name: 'Move to Under Review' })
    expect(
      screen.queryByRole('button', { name: /^Move to (?!Under Review)/ }),
    ).not.toBeInTheDocument()

    await user.click(transitionButton)

    const dialog = await screen.findByRole('dialog', { name: 'Update claim status' })
    expect(within(dialog).getByRole('button', { name: 'Yes' })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'No' })).toBeInTheDocument()
    expect(within(dialog).queryByRole('textbox')).not.toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Yes' }))

    await waitFor(() => {
      expect(screen.getByText('Under Review')).toBeInTheDocument()
    })
    expect(screen.queryByText('Submitted')).not.toBeInTheDocument()
    await expect(claimApi.get(4)).resolves.toMatchObject({ status: 'under_review' })
  })

  it('keeps the claim status when the transition dialog is dismissed', async () => {
    const user = userEvent.setup()
    renderPage(4)

    await screen.findByRole('heading', { name: 'CLM-5004', level: 1 })
    await user.click(screen.getByRole('button', { name: 'Move to Under Review' }))

    const dialog = await screen.findByRole('dialog', { name: 'Update claim status' })
    await user.click(within(dialog).getByRole('button', { name: 'No' }))

    expect(screen.getByText('Submitted')).toBeInTheDocument()
    await expect(claimApi.get(4)).resolves.toMatchObject({ status: 'submitted' })
  })

  it('renders no transition buttons for a claim in a terminal status', async () => {
    renderPage(3)

    await screen.findByRole('heading', { name: 'CLM-5003', level: 1 })
    expect(screen.getByText('Settled')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Move to/ })).not.toBeInTheDocument()
  })
})
