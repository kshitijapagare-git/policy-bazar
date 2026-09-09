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
  Tooltip,
  type Column,
} from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { useDebounce } from '@/hooks/useDebounce'
import { useListParams } from '@/hooks/useListParams'
import { CLAIM_STATUSES } from '@/lib/constants'
import { formatCurrency, truncate } from '@/lib/formatters'
import { claimApi } from '../api/claimApi'
import { policyApi } from '@/features/policies/api/policyApi'
import type { Claim } from '@/types'

export function ClaimListPage() {
  const navigate = useNavigate()
  const list = useListParams({ initialSortBy: 'claimNumber' })
  const debouncedSearch = useDebounce(list.search)
  const [pendingDelete, setPendingDelete] = useState<Claim | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filterKey = JSON.stringify(list.filters)

  const { data, loading, error, reload } = useAsync(
    () =>
      claimApi.list({
        page: list.page,
        pageSize: list.pageSize,
        search: debouncedSearch,
        sortBy: list.sortBy,
        sortDir: list.sortDir,
        filters: list.filters,
      }),
    [list.page, list.pageSize, debouncedSearch, list.sortBy, list.sortDir, filterKey],
  )

  const { data: policyOptions } = useAsync(() => policyApi.options(), [])

  const policyLabels = useMemo(() => {
    const map = new Map<string, string>()
    for (const option of policyOptions ?? []) map.set(option.value, option.label)
    return map
  }, [policyOptions])

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await claimApi.remove(pendingDelete.id)
      setPendingDelete(null)
      reload()
    } finally {
      setDeleting(false)
    }
  }, [pendingDelete, reload])

  const columns = useMemo<Column<Claim>[]>(
    () => [
      {
        key: 'claimNumber',
        header: 'Claim number',
        sortable: true,
        primary: true,
        render: (claim) => (
          <Link to={`/claims/${claim.id}`} className="font-medium text-sky-700 hover:underline">
            {claim.claimNumber}
          </Link>
        ),
      },
      {
        key: 'policyId',
        header: 'Policy',
        sortable: true,
        render: (claim) => (
          <Link to={`/policies/${claim.policyId}`} className="text-slate-700 hover:underline">
            {policyLabels.get(String(claim.policyId)) ?? `#${claim.policyId}`}
          </Link>
        ),
      },
      {
        key: 'description',
        header: 'Description',
        render: (claim) =>
          claim.description.length > 48 ? (
            <Tooltip label={claim.description}>
              <span>{truncate(claim.description, 48)}</span>
            </Tooltip>
          ) : (
            claim.description
          ),
      },
      {
        key: 'amount',
        header: 'Amount',
        sortable: true,
        align: 'right',
        numeric: true,
        render: (claim) => formatCurrency(claim.amount),
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (claim) => <StatusBadge status={claim.status} />,
      },
    ],
    [policyLabels],
  )

  return (
    <>
      <PageHeader
        title="Claims"
        subtitle="Search claim descriptions and filter by status."
        actions={
          <Button onClick={() => navigate('/claims/new')}>
            <Icon name="plus" className="h-4 w-4" />
            New claim
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <TableFilters
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: CLAIM_STATUSES,
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
            placeholder="Search descriptions…"
            label="Search claims"
          />
        </TableFilters>

        <CrudList
          caption="Claims"
          columns={columns}
          rows={data?.items ?? []}
          getRowKey={(claim) => claim.id}
          loading={loading}
          error={error}
          emptyTitle="No claims found"
          emptyMessage="Try clearing the search or filters, or file a new claim."
          sortBy={list.sortBy}
          sortDir={list.sortDir}
          onSortChange={list.toggleSort}
          renderActions={(claim) => (
            <ActionMenu
              label={`Actions for ${claim.claimNumber}`}
              items={[
                { label: 'View', onSelect: () => navigate(`/claims/${claim.id}`) },
                { label: 'Edit', onSelect: () => navigate(`/claims/${claim.id}/edit`) },
                { label: 'Delete', destructive: true, onSelect: () => setPendingDelete(claim) },
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
        title="Delete claim"
        message={
          pendingDelete
            ? `${pendingDelete.claimNumber} will be permanently removed. This cannot be undone.`
            : undefined
        }
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}
