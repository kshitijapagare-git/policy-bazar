import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, Spinner } from '@/components/ui'
import { policyApi } from '../api/policyApi'
import { PolicyFormFields, type PolicyErrors } from '../components/PolicyFormFields'
import type { PolicyInput } from '@/types'

const EMPTY: PolicyInput = {
  policyNumber: '',
  holderName: '',
  type: '',
  premium: 0,
  status: '',
}

function validate(values: PolicyInput): PolicyErrors {
  const errors: PolicyErrors = {}

  if (!values.policyNumber.trim()) errors.policyNumber = 'Policy number is required'
  if (!values.holderName.trim()) errors.holderName = 'Holder name is required'
  if (!values.type) errors.type = 'Type is required'
  if (!values.status) errors.status = 'Status is required'

  if (Number.isNaN(values.premium)) errors.premium = 'Premium is required'
  else if (values.premium <= 0) errors.premium = 'Premium must be greater than zero'

  return errors
}

export function PolicyFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = id !== undefined
  const policyId = Number(id)
  const navigate = useNavigate()

  const [values, setValues] = useState<PolicyInput>(EMPTY)
  const [errors, setErrors] = useState<PolicyErrors>({})
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEdit) return

    let active = true
    setLoading(true)

    policyApi
      .get(policyId)
      .then((policy) => {
        if (!active) return
        const { id: _ignored, ...rest } = policy
        setValues(rest)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setSubmitError(cause instanceof Error ? cause.message : 'Failed to load policy')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [isEdit, policyId])

  function handleChange<K extends keyof PolicyInput>(field: K, value: PolicyInput[K]) {
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
      const saved = isEdit
        ? await policyApi.update(policyId, values)
        : await policyApi.create(values)
      navigate(`/policies/${saved.id}`)
    } catch (cause: unknown) {
      setSubmitError(cause instanceof Error ? cause.message : 'Failed to save policy')
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
        title={isEdit ? 'Edit policy' : 'New policy'}
        subtitle={isEdit ? 'Update the details of this policy.' : 'Add a policy to the book.'}
      />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6"
      >
        <PolicyFormFields
          values={values}
          errors={errors}
          disabled={saving}
          onChange={handleChange}
        />

        {submitError && (
          <p role="alert" className="mt-4 text-sm text-rose-600">
            {submitError}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => navigate('/policies')} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create policy'}
          </Button>
        </div>
      </form>
    </>
  )
}
