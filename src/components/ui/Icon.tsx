import { cn } from '@/lib/cn'

export type IconName =
  | 'dashboard'
  | 'shield'
  | 'claim'
  | 'menu'
  | 'close'
  | 'plus'
  | 'search'
  | 'money'
  | 'pulse'
  | 'check'
  | 'chevron'

export interface IconProps {
  name: IconName
  className?: string
}

/** Inline 24x24 stroke icons - no icon-font or runtime dependency. */
const PATHS: Record<IconName, string> = {
  dashboard: 'M4 13h6V4H4v9Zm0 7h6v-4H4v4Zm10 0h6v-9h-6v9Zm0-16v4h6V4h-6Z',
  shield: 'M12 3 5 6v5c0 4.4 2.9 8.5 7 10 4.1-1.5 7-5.6 7-10V6l-7-3Z',
  claim: 'M8 3h6l5 5v13H5V3h3Zm5 0v6h6M8 13h8M8 17h5',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  plus: 'M12 5v14M5 12h14',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5.5-1.5L21 21',
  money: 'M3 7h18v10H3V7Zm9 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  pulse: 'M3 12h4l2-6 4 12 2-6h6',
  check: 'M5 13l4 4L19 7',
  chevron: 'M9 6l6 6-6 6',
}

export function Icon({ name, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-5 w-5 shrink-0', className)}
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
