import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, ConfirmDialog, EmptyState, Spinner, StatusBadge } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { formatCurrency, humanize } from '@/lib/formatters'
import { claimApi } from '../api/claimApi'
import { getAvailableTransitions } from '../lib/claimTransitions'
import { policyApi } from '@/features/policies/api/policyApi'

export function ClaimDetailPage() {
  const { id } = useParams<{ id: string }>()
  const claimId = Number(id)
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [pendingTransition, setPendingTransition] = useState<string | null>(null)
  const [transitioning, setTransitioning] = useState(false)

  const { data: claim, loading, error, reload } = useAsync(() => claimApi.get(claimId), [claimId])
  const { data: policy } = useAsync(
    () => (claim ? policyApi.get(claim.policyId) : Promise.resolve(null)),
    [claim?.policyId],
  )

  async function handleDelete() {
    setDeleting(true)
    try {
      await claimApi.remove(claimId)
      navigate('/claims')
    } finally {
      setDeleting(false)
    }
  }

  async function handleTransitionConfirm() {
    if (!pendingTransition) return
    setTransitioning(true)
    try {
      await claimApi.transition(claimId, pendingTransition)
      reload()
      setPendingTransition(null)
    } finally {
      setTransitioning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (error || !claim) {
    return (
      <EmptyState
        title="Claim not found"
        message={error ?? 'That claim may have been deleted.'}
        action={
          <Button variant="secondary" onClick={() => navigate('/claims')}>
            Back to claims
          </Button>
        }
      />
    )
  }

  const availableTransitions = getAvailableTransitions(claim.status)

  return (
    <>
      <PageHeader
        title={claim.claimNumber}
        subtitle={formatCurrency(claim.amount)}
        actions={
          <>
            {availableTransitions.map((nextStatus) => (
              <Button
                key={nextStatus}
                variant="secondary"
                onClick={() => setPendingTransition(nextStatus)}
              >
                Move to {humanize(nextStatus)}
              </Button>
            ))}
            <Button variant="secondary" onClick={() => navigate(`/claims/${claim.id}/edit`)}>
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
            Claim number
          </dt>
          <dd className="mt-1 text-sm text-slate-900">{claim.claimNumber}</dd>
        </div>
        <div>
          <dt className="text-[0.6875rem] font-semibold uppercase tracking-wider text-slate-500">
            Policy
          </dt>
          <dd className="mt-1 text-sm">
            <Link to={`/policies/${claim.policyId}`} className="text-sky-700 hover:underline">
              {policy ? `${policy.policyNumber} — ${policy.holderName}` : `#${claim.policyId}`}
            </Link>
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-[0.6875rem] font-semibold uppercase tracking-wider text-slate-500">
            Description
          </dt>
          <dd className="mt-1 text-sm text-slate-900">{claim.description}</dd>
        </div>
        <div>
          <dt className="text-[0.6875rem] font-semibold uppercase tracking-wider text-slate-500">
            Amount
          </dt>
          <dd className="numeric mt-1 text-sm text-slate-900">{formatCurrency(claim.amount)}</dd>
        </div>
        <div>
          <dt className="text-[0.6875rem] font-semibold uppercase tracking-wider text-slate-500">
            Status
          </dt>
          <dd className="mt-1">
            <StatusBadge status={claim.status} />
          </dd>
        </div>
      </dl>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete claim"
        message={`${claim.claimNumber} will be permanently removed. This cannot be undone.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      <ConfirmDialog
        open={pendingTransition !== null}
        title="Update claim status"
        message={
          pendingTransition
            ? `Move ${claim.claimNumber} to ${humanize(pendingTransition)}?`
            : undefined
        }
        confirmLabel="Yes"
        cancelLabel="No"
        busy={transitioning}
        onConfirm={handleTransitionConfirm}
        onCancel={() => setPendingTransition(null)}
      />
    </>
  )
}
