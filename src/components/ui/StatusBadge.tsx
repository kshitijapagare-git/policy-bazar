import { Badge, type BadgeTone } from './Badge'
import { STATUS_TONES } from '@/lib/constants'
import { humanize } from '@/lib/formatters'

export interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const tone: BadgeTone = STATUS_TONES[status] ?? 'neutral'
  return (
    <Badge tone={tone} className={className}>
      {humanize(status)}
    </Badge>
  )
}
