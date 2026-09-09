import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActionMenu } from '../ActionMenu'
import { ConfirmDialog } from '../ConfirmDialog'
import { CrudList, type Column } from '../CrudList'
import { EmptyState } from '../EmptyState'
import { Pagination } from '../Pagination'
import { SearchInput } from '../SearchInput'
import { StatusBadge } from '../StatusBadge'
import { TableFilters } from '../TableFilters'
import { Tooltip } from '../Tooltip'

describe('StatusBadge', () => {
  it('humanises the status text', () => {
    render(<StatusBadge status="under_review" />)
    expect(screen.getByText('Under Review')).toBeInTheDocument()
  })

  it('renders an unmapped status without blowing up', () => {
    render(<StatusBadge status="mystery" />)
    expect(screen.getByText('Mystery')).toBeInTheDocument()
  })
})

describe('EmptyState', () => {
  it('renders the title, message and action', () => {
    render(<EmptyState title="Nothing" message="Try again" action={<button>Retry</button>} />)

    expect(screen.getByText('Nothing')).toBeInTheDocument()
    expect(screen.getByText('Try again')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })
})

describe('SearchInput', () => {
  it('reports each keystroke', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SearchInput value="" onChange={onChange} label="Find" />)

    await user.type(screen.getByRole('searchbox', { name: 'Find' }), 'ab')

    expect(onChange).toHaveBeenCalledTimes(2)
  })
})

describe('Pagination', () => {
  it('summarises the current window', () => {
    render(<Pagination page={2} pageSize={10} total={23} onPageChange={vi.fn()} />)

    const nav = screen.getByRole('navigation', { name: 'Pagination' })
    expect(within(nav).getByText('11')).toBeInTheDocument()
    expect(within(nav).getByText('20')).toBeInTheDocument()
    expect(within(nav).getByText('Page 2 of 3')).toBeInTheDocument()
  })

  it('disables Previous on the first page and Next on the last', () => {
    const { unmount } = render(
      <Pagination page={1} pageSize={10} total={23} onPageChange={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled()
    unmount()

    render(<Pagination page={3} pageSize={10} total={23} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('reports the requested page', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination page={2} pageSize={10} total={23} onPageChange={onPageChange} />)

    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('handles an empty result set', () => {
    render(<Pagination page={1} pageSize={10} total={0} onPageChange={vi.fn()} />)

    const nav = screen.getByRole('navigation', { name: 'Pagination' })
    expect(within(nav).getByText('Page 1 of 1')).toBeInTheDocument()
  })
})

interface Row {
  id: number
  name: string
}

const COLUMNS: Column<Row>[] = [
  { key: 'name', header: 'Name', sortable: true, render: (row) => row.name },
]

describe('CrudList', () => {
  it('renders rows', () => {
    render(
      <CrudList columns={COLUMNS} rows={[{ id: 1, name: 'Ada' }]} getRowKey={(row) => row.id} />,
    )
    expect(screen.getByText('Ada')).toBeInTheDocument()
  })

  it('shows a spinner while loading', () => {
    render(<CrudList columns={COLUMNS} rows={[]} getRowKey={(row) => row.id} loading />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows the error instead of the table', () => {
    render(<CrudList columns={COLUMNS} rows={[]} getRowKey={(row) => row.id} error="Boom" />)

    expect(screen.getByRole('alert')).toHaveTextContent('Boom')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('shows the empty state when there are no rows', () => {
    render(
      <CrudList columns={COLUMNS} rows={[]} getRowKey={(row) => row.id} emptyTitle="All clear" />,
    )
    expect(screen.getByText('All clear')).toBeInTheDocument()
  })

  it('marks the sorted column for assistive tech', () => {
    render(
      <CrudList
        columns={COLUMNS}
        rows={[{ id: 1, name: 'Ada' }]}
        getRowKey={(row) => row.id}
        sortBy="name"
        sortDir="desc"
        onSortChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute(
      'aria-sort',
      'descending',
    )
  })

  it('reports sort requests', async () => {
    const user = userEvent.setup()
    const onSortChange = vi.fn()
    render(
      <CrudList
        columns={COLUMNS}
        rows={[{ id: 1, name: 'Ada' }]}
        getRowKey={(row) => row.id}
        onSortChange={onSortChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Name/ }))

    expect(onSortChange).toHaveBeenCalledWith('name')
  })
})

describe('ActionMenu', () => {
  it('opens on click and fires the chosen item', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<ActionMenu items={[{ label: 'Edit', onSelect }]} />)

    const trigger = screen.getByRole('button', { name: 'Row actions' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('closes on Escape without firing anything', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<ActionMenu items={[{ label: 'Edit', onSelect }]} />)

    await user.click(screen.getByRole('button', { name: 'Row actions' }))
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(onSelect).not.toHaveBeenCalled()
  })
})

describe('ConfirmDialog', () => {
  it('renders nothing while closed', () => {
    render(<ConfirmDialog open={false} title="Delete" onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('confirms and cancels', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        open
        title="Delete thing"
        message="Sure?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    )

    const dialog = screen.getByRole('dialog', { name: 'Delete thing' })
    expect(within(dialog).getByText('Sure?')).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('cancels on Escape', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<ConfirmDialog open title="Delete" onConfirm={vi.fn()} onCancel={onCancel} />)

    await user.keyboard('{Escape}')

    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})

describe('TableFilters', () => {
  it('reports a chosen value and only offers Clear once something is set', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const filters = [
      { key: 'status', label: 'Status', options: [{ label: 'Active', value: 'active' }] },
    ]

    const { unmount } = render(
      <TableFilters filters={filters} values={{}} onChange={onChange} onReset={vi.fn()} />,
    )
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Status'), 'active')
    expect(onChange).toHaveBeenCalledWith('status', 'active')
    unmount()

    render(
      <TableFilters
        filters={filters}
        values={{ status: 'active' }}
        onChange={onChange}
        onReset={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument()
  })
})

describe('Tooltip', () => {
  it('reveals its label on hover', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip label="Full text">
        <span>Trimmed</span>
      </Tooltip>,
    )

    expect(screen.getByRole('tooltip', { hidden: true })).not.toBeVisible()

    await user.hover(screen.getByText('Trimmed'))
    expect(screen.getByRole('tooltip')).toBeVisible()
  })
})
