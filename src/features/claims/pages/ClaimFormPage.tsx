import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, Spinner } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { claimApi } from '../api/claimApi'
import { policyApi } from '@/features/policies/api/policyApi'
import { ClaimFormFields, type ClaimErrors } from '../components/ClaimFormFields'
import type { ClaimInput } from '@/types'

const EMPTY: ClaimInput = {
  claimNumber: '',
  policyId: 0,
  description: '',
  amount: 0,
  status: '',
}

function validate(values: ClaimInput): ClaimErrors {
  const errors: ClaimErrors = {}

  if (!values.claimNumber.trim()) errors.claimNumber = 'Claim number is required'
  if (!values.policyId) errors.policyId = 'Policy is required'
  if (!values.description.trim()) errors.description = 'Description is required'
  if (!values.status) errors.status = 'Status is required'

  if (Number.isNaN(values.amount)) errors.amount = 'Amount is required'
  else if (values.amount <= 0) errors.amount = 'Amount must be greater than zero'

  return errors
}

export function ClaimFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = id !== undefined
  const claimId = Number(id)
  const navigate = useNavigate()

  const [values, setValues] = useState<ClaimInput>(EMPTY)
  const [errors, setErrors] = useState<ClaimErrors>({})
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data: policyOptions } = useAsync(() => policyApi.options(), [])

  useEffect(() => {
    if (!isEdit) return

    let active = true
    setLoading(true)

    claimApi
      .get(claimId)
      .then((claim) => {
        if (!active) return
        const { id: _ignored, ...rest } = claim
        setValues(rest)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setSubmitError(cause instanceof Error ? cause.message : 'Failed to load claim')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [isEdit, claimId])

  function handleChange<K extends keyof ClaimInput>(field: K, value: ClaimInput[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(null)

    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSaving(true)
    try {
      const saved = isEdit ? await claimApi.update(claimId, values) : await claimApi.create(values)
      navigate(`/claims/${saved.id}`)
    } catch (cause: unknown) {
      setSubmitError(cause instanceof Error ? cause.message : 'Failed to save claim')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title={isEdit ? 'Edit claim' : 'New claim'}
        subtitle={isEdit ? 'Update the details of this claim.' : 'File a claim against a policy.'}
      />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6"
      >
        <ClaimFormFields
          values={values}
          errors={errors}
          policyOptions={policyOptions ?? []}
          disabled={saving}
          onChange={handleChange}
        />

        {submitError && (
          <p role="alert" className="mt-4 text-sm text-rose-600">
            {submitError}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => navigate('/claims')} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create claim'}
          </Button>
        </div>
      </form>
    </>
  )
}
