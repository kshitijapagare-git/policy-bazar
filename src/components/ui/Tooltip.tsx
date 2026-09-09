import { useId, useState, type ReactNode } from 'react'

export interface TooltipProps {
  label: string
  children: ReactNode
}

/** Hover/focus tooltip. The label is always in the a11y tree via aria-describedby. */
export function Tooltip({ label, children }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <span className="relative inline-flex">
      <span
        aria-describedby={id}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex"
      >
        {children}
      </span>
      <span
        role="tooltip"
        id={id}
        hidden={!open}
        className="absolute bottom-full left-1/2 z-20 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white shadow-lg"
      >
        {label}
      </span>
    </span>
  )
}
