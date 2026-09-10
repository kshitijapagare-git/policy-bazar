import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  ActionMenu,
  Button,
  Card,
  ConfirmDialog,
  CrudList,
  Icon,
  Pagination,
  SearchInput,
  StatusBadge,
  TableFilters,
  type Column,
} from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { useDebounce } from '@/hooks/useDebounce'
import { useListParams } from '@/hooks/useListParams'
import { POLICY_STATUSES, POLICY_TYPES } from '@/lib/constants'
import { formatCurrency, formatDate, humanize } from '@/lib/formatters'
import { policyApi } from '../api/policyApi'
import type { Policy } from '@/types'

export function PolicyListPage() {
  const navigate = useNavigate()
  const list = useListParams({ initialSortBy: 'policyNumber' })
  const debouncedSearch = useDebounce(list.search)
  const [pendingDelete, setPendingDelete] = useState<Policy | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filterKey = JSON.stringify(list.filters)

  const { data, loading, error, reload } = useAsync(
    () =>
      policyApi.list({
        page: list.page,
        pageSize: list.pageSize,
        search: debouncedSearch,
        sortBy: list.sortBy,
        sortDir: list.sortDir,
        filters: list.filters,
      }),
    [list.page, list.pageSize, debouncedSearch, list.sortBy, list.sortDir, filterKey],
  )

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await policyApi.remove(pendingDelete.id)
      setPendingDelete(null)
      reload()
    } finally {
      setDeleting(false)
    }
  }, [pendingDelete, reload])

  const columns = useMemo<Column<Policy>[]>(
    () => [
      {
        key: 'policyNumber',
        header: 'Policy number',
        sortable: true,
        primary: true,
        render: (policy) => (
          <Link to={`/policies/${policy.id}`} className="font-medium text-sky-700 hover:underline">
            {policy.policyNumber}
          </Link>
        ),
      },
      {
        key: 'holderName',
        header: 'Holder',
        sortable: true,
        render: (policy) => policy.holderName,
      },
      { key: 'type', header: 'Type', sortable: true, render: (policy) => humanize(policy.type) },
      {
        key: 'premium',
        header: 'Premium',
        sortable: true,
        align: 'right',
        numeric: true,
        render: (policy) => formatCurrency(policy.premium),
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (policy) => <StatusBadge status={policy.status} />,
      },
      {
        key: 'renewalDate',
        header: 'Renewal date',
        sortable: true,
        render: (policy) => formatDate(policy.renewalDate),
      },
    ],
    [],
  )

  return (
    <>
      <PageHeader
        title="Policies"
        subtitle="Every policy on the book, searchable and filterable."
        actions={
          <Button onClick={() => navigate('/policies/new')}>
            <Icon name="plus" className="h-4 w-4" />
            New policy
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <TableFilters
          filters={[
            { key: 'type', label: 'Type', options: POLICY_TYPES, placeholder: 'All types' },
            {
              key: 'status',
              label: 'Status',
              options: POLICY_STATUSES,
              placeholder: 'All statuses',
            },
          ]}
          values={list.filters}
          onChange={list.setFilter}
          onReset={list.resetFilters}
        >
          <SearchInput
            className="w-full lg:w-64"
            value={list.search}
            onChange={list.setSearch}
            placeholder="Search policies…"
            label="Search policies"
          />
        </TableFilters>

        <CrudList
          caption="Policies"
          columns={columns}
          rows={data?.items ?? []}
          getRowKey={(policy) => policy.id}
          loading={loading}
          error={error}
          emptyTitle="No policies found"
          emptyMessage="Try clearing the search or filters, or create a new policy."
          sortBy={list.sortBy}
          sortDir={list.sortDir}
          onSortChange={list.toggleSort}
          renderActions={(policy) => (
            <ActionMenu
              label={`Actions for ${policy.policyNumber}`}
              items={[
                { label: 'View', onSelect: () => navigate(`/policies/${policy.id}`) },
                { label: 'Edit', onSelect: () => navigate(`/policies/${policy.id}/edit`) },
                { label: 'Delete', destructive: true, onSelect: () => setPendingDelete(policy) },
              ]}
            />
          )}
        />

        {data && data.total > 0 && (
          <Pagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            onPageChange={list.setPage}
            onPageSizeChange={list.setPageSize}
          />
        )}
      </Card>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete policy"
        message={
          pendingDelete
            ? `${pendingDelete.policyNumber} will be permanently removed. This cannot be undone.`
            : undefined
        }
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}
