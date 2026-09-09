import { FormField, Input, Select } from '@/components/ui'
import { CLAIM_STATUSES } from '@/lib/constants'
import type { ClaimInput, SelectOption } from '@/types'

export type ClaimErrors = Partial<Record<keyof ClaimInput, string>>

export interface ClaimFormFieldsProps {
  values: ClaimInput
  errors: ClaimErrors
  /** Populated from the Policy list - the many-to-one relation on `policyId`. */
  policyOptions: SelectOption[]
  disabled?: boolean
  onChange: <K extends keyof ClaimInput>(field: K, value: ClaimInput[K]) => void
}

export function ClaimFormFields({
  values,
  errors,
  policyOptions,
  disabled = false,
  onChange,
}: ClaimFormFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Claim number" htmlFor="claimNumber" required error={errors.claimNumber}>
        <Input
          id="claimNumber"
          value={values.claimNumber}
          disabled={disabled}
          invalid={Boolean(errors.claimNumber)}
          placeholder="CLM-5678"
          onChange={(event) => onChange('claimNumber', event.target.value)}
        />
      </FormField>

      <FormField label="Policy" htmlFor="policyId" required error={errors.policyId}>
        <Select
          id="policyId"
          value={values.policyId ? String(values.policyId) : ''}
          disabled={disabled}
          invalid={Boolean(errors.policyId)}
          placeholder="Select a policy"
          options={policyOptions}
          onChange={(event) => onChange('policyId', Number(event.target.value))}
        />
      </FormField>

      <FormField
        label="Description"
        htmlFor="description"
        required
        error={errors.description}
        className="sm:col-span-2"
      >
        <Input
          id="description"
          value={values.description}
          disabled={disabled}
          invalid={Boolean(errors.description)}
          placeholder="What happened?"
          onChange={(event) => onChange('description', event.target.value)}
        />
      </FormField>

      <FormField
        label="Amount"
        htmlFor="amount"
        required
        error={errors.amount}
        hint="Claimed amount in USD"
      >
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={Number.isNaN(values.amount) ? '' : String(values.amount)}
          disabled={disabled}
          invalid={Boolean(errors.amount)}
          onChange={(event) => onChange('amount', event.target.valueAsNumber)}
        />
      </FormField>

      <FormField label="Status" htmlFor="status" required error={errors.status}>
        <Select
          id="status"
          value={values.status}
          disabled={disabled}
          invalid={Boolean(errors.status)}
          placeholder="Select a status"
          options={CLAIM_STATUSES}
          onChange={(event) => onChange('status', event.target.value)}
        />
      </FormField>
    </div>
  )
}
