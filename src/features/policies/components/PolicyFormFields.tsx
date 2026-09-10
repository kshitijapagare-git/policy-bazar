import { FormField, Input, Select } from '@/components/ui'
import { POLICY_STATUSES, POLICY_TYPES } from '@/lib/constants'
import type { PolicyInput } from '@/types'

export type PolicyErrors = Partial<Record<keyof PolicyInput, string>>

export interface PolicyFormFieldsProps {
  values: PolicyInput
  errors: PolicyErrors
  disabled?: boolean
  onChange: <K extends keyof PolicyInput>(field: K, value: PolicyInput[K]) => void
}

export function PolicyFormFields({
  values,
  errors,
  disabled = false,
  onChange,
}: PolicyFormFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Policy number" htmlFor="policyNumber" required error={errors.policyNumber}>
        <Input
          id="policyNumber"
          value={values.policyNumber}
          disabled={disabled}
          invalid={Boolean(errors.policyNumber)}
          placeholder="POL-1234"
          onChange={(event) => onChange('policyNumber', event.target.value)}
        />
      </FormField>

      <FormField label="Holder name" htmlFor="holderName" required error={errors.holderName}>
        <Input
          id="holderName"
          value={values.holderName}
          disabled={disabled}
          invalid={Boolean(errors.holderName)}
          placeholder="Jane Doe"
          onChange={(event) => onChange('holderName', event.target.value)}
        />
      </FormField>

      <FormField label="Type" htmlFor="type" required error={errors.type}>
        <Select
          id="type"
          value={values.type}
          disabled={disabled}
          invalid={Boolean(errors.type)}
          placeholder="Select a type"
          options={POLICY_TYPES}
          onChange={(event) => onChange('type', event.target.value)}
        />
      </FormField>

      <FormField
        label="Premium"
        htmlFor="premium"
        required
        error={errors.premium}
        hint="Annual premium in USD"
      >
        <Input
          id="premium"
          type="number"
          step="0.01"
          min="0"
          value={Number.isNaN(values.premium) ? '' : String(values.premium)}
          disabled={disabled}
          invalid={Boolean(errors.premium)}
          onChange={(event) => onChange('premium', event.target.valueAsNumber)}
        />
      </FormField>

      <FormField label="Status" htmlFor="status" required error={errors.status}>
        <Select
          id="status"
          value={values.status}
          disabled={disabled}
          invalid={Boolean(errors.status)}
          placeholder="Select a status"
          options={POLICY_STATUSES}
          onChange={(event) => onChange('status', event.target.value)}
        />
      </FormField>

      <FormField label="Renewal date" htmlFor="renewalDate" required error={errors.renewalDate}>
        <Input
          id="renewalDate"
          type="date"
          value={values.renewalDate}
          disabled={disabled}
          invalid={Boolean(errors.renewalDate)}
          onChange={(event) => onChange('renewalDate', event.target.value)}
        />
      </FormField>
    </div>
  )
}
