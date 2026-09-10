import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  Button,
  Card,
  ConfirmDialog,
  CrudList,
  EmptyState,
  Pagination,
  Spinner,
  StatusBadge,
} from '@/components/ui'
import type { Column } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { formatCurrency, formatDate, humanize } from '@/lib/formatters'
import { PAGE_SIZE } from '@/lib/constants'
import { policyApi } from '../api/policyApi'
import { claimApi } from '@/features/claims/api/claimApi'
import type { Claim } from '@/types'

export function PolicyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const policyId = Number(id)
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [claimsPage, setClaimsPage] = useState(1)

  const { data: policy, loading, error } = useAsync(() => policyApi.get(policyId), [policyId])
  const { data: claims, loading: claimsLoading } = useAsync(
    () =>
      claimApi.list({
        page: claimsPage,
        pageSize: PAGE_SIZE,
        filters: { policyId: String(policyId) },
        sortBy: 'claimNumber',
      }),
    [policyId, claimsPage],
  )

  const claimColumns = useMemo<Column<Claim>[]>(
    () => [
      {
        key: 'claimNumber',
        header: 'Claim number',
        primary: true,
        render: (claim) => (
          <Link to={`/claims/${claim.id}`} className="font-medium text-sky-700 hover:underline">
            {claim.claimNumber}
          </Link>
        ),
      },
      {
        key: 'description',
        header: 'Description',
        render: (claim) => claim.description,
      },
      {
        key: 'amount',
        header: 'Amount',
        align: 'right',
        numeric: true,
        render: (claim) => formatCurrency(claim.amount),
      },
      {
        key: 'status',
        header: 'Status',
        render: (claim) => <StatusBadge status={claim.status} />,
      },
    ],
    [],
  )

  async function handleDelete() {
    setDeleting(true)
    try {
      await policyApi.remove(policyId)
      navigate('/policies')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (error || !policy) {
    return (
      <EmptyState
        title="Policy not found"
        message={error ?? 'That policy may have been deleted.'}
        action={
          <Button variant="secondary" onClick={() => navigate('/policies')}>
            Back to policies
          </Button>
        }
      />
    )
  }

  return (
    <>
      <PageHeader
        title={policy.policyNumber}
        subtitle={`Held by ${policy.holderName}`}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate(`/policies/${policy.id}/edit`)}>
              Edit
            </Button>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              Delete
            </Button>
          </>
        }
      />

      <dl className="grid gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:grid-cols-2 sm:gap-5 sm:p-6">
        <div>
          <dt className="text-[0.6875rem] font-semibold uppercase tracking-wider text-slate-500">
            Policy number
          </dt>
          <dd className="mt-1 text-sm text-slate-900">{policy.policyNumber}</dd>
        </div>
        <div>
          <dt className="text-[0.6875rem] font-semibold uppercase tracking-wider text-slate-500">
            Holder name
          </dt>
          <dd className="mt-1 text-sm text-slate-900">{policy.holderName}</dd>
        </div>
        <div>
          <dt className="text-[0.6875rem] font-semibold uppercase tracking-wider text-slate-500">
            Type
          </dt>
          <dd className="mt-1 text-sm text-slate-900">{humanize(policy.type)}</dd>
        </div>
        <div>
          <dt className="text-[0.6875rem] font-semibold uppercase tracking-wider text-slate-500">
            Premium
          </dt>
          <dd className="mt-1 text-sm text-slate-900">{formatCurrency(policy.premium)}</dd>
        </div>
        <div>
          <dt className="text-[0.6875rem] font-semibold uppercase tracking-wider text-slate-500">
            Status
          </dt>
          <dd className="mt-1">
            <StatusBadge status={policy.status} />
          </dd>
        </div>
        <div>
          <dt className="text-[0.6875rem] font-semibold uppercase tracking-wider text-slate-500">
            Renewal date
          </dt>
          <dd className="mt-1 text-sm text-slate-900">{formatDate(policy.renewalDate)}</dd>
        </div>
      </dl>

      <Card className="mt-4 overflow-hidden sm:mt-6">
        <h2 className="border-b border-slate-200/80 px-4 py-3.5 text-sm font-semibold text-slate-900 sm:px-6">
          Claims on this policy
        </h2>
        <CrudList
          caption="Claims on this policy"
          columns={claimColumns}
          rows={claims?.items ?? []}
          getRowKey={(claim) => claim.id}
          loading={claimsLoading}
          emptyTitle="No claims yet"
          emptyMessage="Claims filed against this policy will appear here."
        />

        {claims && claims.total > 0 && (
          <Pagination
            page={claims.page}
            pageSize={claims.pageSize}
            total={claims.total}
            onPageChange={setClaimsPage}
          />
        )}
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete policy"
        message={`${policy.policyNumber} will be permanently removed. This cannot be undone.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}
