import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, Card, ConfirmDialog, EmptyState, Spinner, StatusBadge } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { formatCurrency, humanize } from '@/lib/formatters'
import { policyApi } from '../api/policyApi'
import { claimApi } from '@/features/claims/api/claimApi'

export function PolicyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const policyId = Number(id)
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { data: policy, loading, error } = useAsync(() => policyApi.get(policyId), [policyId])
  const { data: claims } = useAsync(() => claimApi.listByPolicy(policyId), [policyId])

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
      </dl>

      <Card className="mt-4 overflow-hidden sm:mt-6">
        <h2 className="border-b border-slate-200/80 px-4 py-3.5 text-sm font-semibold text-slate-900 sm:px-6">
          Claims on this policy
        </h2>
        {claims && claims.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {claims.map((claim) => (
              <li
                key={claim.id}
                className="flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6"
              >
                <div className="min-w-0">
                  <Link
                    to={`/claims/${claim.id}`}
                    className="text-sm font-medium text-sky-700 hover:underline"
                  >
                    {claim.claimNumber}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{claim.description}</p>
                </div>
                <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                  <span className="numeric text-sm font-medium text-slate-900">
                    {formatCurrency(claim.amount)}
                  </span>
                  <StatusBadge status={claim.status} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No claims yet"
            message="Claims filed against this policy will appear here."
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
