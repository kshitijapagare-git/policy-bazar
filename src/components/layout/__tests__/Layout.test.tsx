import { describe, expect, it } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '../Layout'

function renderLayout(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<div>dashboard body</div>} />
          <Route path="policies" element={<div>policies body</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('Layout', () => {
  it('renders the shell and the routed child', () => {
    renderLayout()

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByText('dashboard body')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  })

  it('marks the current route as active', () => {
    renderLayout('/policies')

    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Policies' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('keeps the mobile drawer closed until it is asked for', () => {
    renderLayout()

    expect(screen.queryByRole('dialog', { name: 'Navigation' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeInTheDocument()
  })

  it('opens the drawer and locks background scrolling', async () => {
    const user = userEvent.setup()
    renderLayout()

    await user.click(screen.getByRole('button', { name: 'Open navigation' }))

    const drawer = await screen.findByRole('dialog', { name: 'Navigation' })
    expect(within(drawer).getByRole('link', { name: 'Claims' })).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('closes the drawer on Escape and restores scrolling', async () => {
    const user = userEvent.setup()
    renderLayout()

    await user.click(screen.getByRole('button', { name: 'Open navigation' }))
    await screen.findByRole('dialog', { name: 'Navigation' })

    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Navigation' })).not.toBeInTheDocument()
    })
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('closes the drawer via its close button', async () => {
    const user = userEvent.setup()
    renderLayout()

    await user.click(screen.getByRole('button', { name: 'Open navigation' }))
    await screen.findByRole('dialog', { name: 'Navigation' })

    await user.click(screen.getByRole('button', { name: 'Close navigation' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Navigation' })).not.toBeInTheDocument()
    })
  })

  it('closes the drawer after following one of its links', async () => {
    const user = userEvent.setup()
    renderLayout()

    await user.click(screen.getByRole('button', { name: 'Open navigation' }))
    const drawer = await screen.findByRole('dialog', { name: 'Navigation' })

    await user.click(within(drawer).getByRole('link', { name: 'Policies' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Navigation' })).not.toBeInTheDocument()
    })
    expect(screen.getByText('policies body')).toBeInTheDocument()
  })
})
